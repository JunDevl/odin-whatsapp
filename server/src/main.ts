import express, { Router } from "express";
import type { RequestHandler } from "express";
import { body, matchedData, validationResult, type ValidationChain } from "express-validator";
import cookieParser from "cookie-parser";
import cookie from "cookie";

import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";

import cors from "cors";
import jwt from "jsonwebtoken";
// import prisma from "../lib/prisma.ts";
import { Server, Socket } from "socket.io";

import passport from "passport";
import { localStrategy } from "./auth.ts";
import { JWTStrategy } from "./auth.ts";

import usersRouter from "./routes/usersRouter.ts";
import type { User } from "../generated/prisma/client.ts";
import { handleError, PromiseError } from "@packages/utils";
import prisma from "../lib/prisma.ts";
import { createMessage, deleteMessages, updateMessage } from "./controllers/messagesController.ts";
import messagesRouter from "./routes/messagesRouter.ts";
import groupsRouter from "./routes/groupsRouter.ts";

const PORT = 8080;

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const apiRouter = Router();

passport.use(localStrategy);
passport.use(JWTStrategy);

app.use("/api", apiRouter);

apiRouter.use("/users", usersRouter);

apiRouter.use("/messages", messagesRouter);

apiRouter.use("/groups", groupsRouter);

app.use((err: any, _: any, res: any, __: any) => {
  console.error(err.stack);
  res.send(`Message: ${err.message}\n\nStack: ${err.stack}`);
})

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
  cookie: true
});

export const connectedUsers = new Map<string, Socket>();

io.use((socket, next) => {
  try {
    const rawCookies = socket.handshake.headers.cookie;
    if (!rawCookies) return next(new Error('No cookies sent'));

    const parsed = cookie.parse(rawCookies);
    const token = parsed["session_token"];
    if (!token) return next(new Error('Not authenticated'));

    const payload = jwt.verify(token, process.env["SECRET_KEY"]!);
    socket.data.user = payload; // attach identity to the socket
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
});

const JWT_REGEN_TIME = 60/*seconds*/ *60/*minutes*/ *24/*hours*/ *2/*days*/; // At 2 days before expiring JWT

io.engine.on("initial_headers", (headers, request) => {
  const rawCookies = request.headers.cookie;

  if (!rawCookies) return;

  const parsed = cookie.parse(rawCookies);
  const token = parsed["session_token"];

  if (!token) return;

  try {
    const {exp, iat, ...verified} = jwt.verify(token, process.env["SECRET_KEY"]!) as Record<string, any>;

    if (exp - iat > JWT_REGEN_TIME) return;

    const newToken = jwt.sign(verified, process.env["SECRET_KEY"]!, {expiresIn: "7d"});

    const serialized = cookie.serialize("session_token", newToken, {
      path: "/"
    });
  
    headers["set-cookie"] = serialized;
  } catch (e) {return}
})

type Reciever = { kind: "user", name: string } | { kind: "group", id: string };
type AckFunction = (arg: {data: any} | {data: null, error: any}) => void;

io.on("connection", socket => {
  const user = socket.data.user as User;

  connectedUsers.set(user.name, socket);

  socket.on("createMessage", async (content: string, reciever: Reciever, ack: AckFunction) => {
    const {kind: recieverKind} = reciever;
    const recieverIdentification = recieverKind === "user" ? reciever.name : reciever.id;

    const recieverExists = await handleError(
      recieverKind === "user" ?
      
      prisma.user.findUnique({
        where: { name: recieverIdentification },
        select: { id: true }
      }) :

      prisma.group.findUnique({
        where: { id: recieverIdentification },
        select: { id: true }
      })
    )

    if (recieverExists instanceof PromiseError) return ack({
      data: null,
      error: recieverExists.error
    });

    if (!recieverExists) return ack({
      data: null,
      error: `Reciever (${recieverKind}) ${recieverIdentification} doesn't exist.`
    });

    const createdMessage = await handleError(
      createMessage(user.id, content, { kind: recieverKind, id: recieverExists.id }
    ));

    if (createdMessage instanceof PromiseError) return ack({
      data: null,
      error: createdMessage.error
    })

    const message = { message: createdMessage };

    const eventName = "recieveMessage"

    const eventEmitPayload = [
      message, 
      { [recieverKind === "user" ? "name" : "id"]: recieverIdentification }
    ]

    if (recieverKind === "group") {
      if (!socket.rooms.has(recieverIdentification)) socket.join(recieverIdentification);

      socket.broadcast.to(recieverIdentification).emit(eventName, ...eventEmitPayload)
    } else {
      const connectedReciever = connectedUsers.get(recieverIdentification);

      if (connectedReciever) io.to(connectedReciever.id).emit(eventName, ...eventEmitPayload);
    }

    ack({data: message});
  })

  socket.on("editMessage", async (id: string, content: string, reciever: Reciever, ack: AckFunction) => {
    const {kind: recieverKind} = reciever;
    const recieverIdentification = recieverKind === "user" ? reciever.name : reciever.id;

    const targetMessage = await handleError(prisma.message.findUnique({
      where: { id },
      include: { messageToGroups: true }
    }))

    if (targetMessage instanceof PromiseError) return ack({
      data: null,
      error: targetMessage.error
    });

    if (!targetMessage) return ack({
      data: null,
      error: `Message of id ${id} is non-existent`
    })

    const editedMessage = await handleError(updateMessage(id, content));

    if (editedMessage instanceof PromiseError) return ack({
      data: null,
      error: editedMessage.error
    })

    const message = { message: editedMessage };

    const eventName = "editMessage"

    const eventEmitPayload = [
      message, 
      { [recieverKind === "user" ? "name" : "id"]: recieverIdentification }
    ]

    if (recieverKind === "group") {
      if (!socket.rooms.has(recieverIdentification)) socket.join(recieverIdentification);

      socket.broadcast.to(recieverIdentification).emit(eventName, ...eventEmitPayload)
    } else {
      const connectedReciever = connectedUsers.get(recieverIdentification);

      if (connectedReciever) io.to(connectedReciever.id).emit(eventName, ...eventEmitPayload);
    }

    ack({data: message})
  })

  socket.on("deleteMessages", async (ids: string[], reciever: Reciever, ack: (...args: any) => void) => {
    const {kind: recieverKind} = reciever;
    const recieverIdentification = recieverKind === "user" ? reciever.name : reciever.id;

    const targetMessages = await handleError(prisma.message.findMany({
      where: { id: { in: ids } }
    }))

    if (targetMessages instanceof PromiseError) return ack({
      data: null,
      error: targetMessages.error
    });

    if (targetMessages.length === 0) return ack({
      data: null,
      error: `Messages of ids: ${ids} are non-existent`
    })

    const deletedMessages = await handleError(deleteMessages(ids));

    if (deletedMessages instanceof PromiseError) return ack({
      data: null,
      error: deletedMessages.error
    })

    const eventName = "deleteMessages";

    const eventEmitPayload = [
      deletedMessages, 
      { [recieverKind === "user" ? "name" : "id"]: recieverIdentification }
    ]

    if (recieverKind === "group") {
      if (!socket.rooms.has(recieverIdentification)) socket.join(recieverIdentification);

      socket.broadcast.to(recieverIdentification).emit(eventName, ...eventEmitPayload);
    } else {
      const connectedReciever = connectedUsers.get(recieverIdentification);

      if (connectedReciever) io.to(connectedReciever.id).emit(eventName, ...eventEmitPayload);
    }

    ack({data: deletedMessages});
  })

  socket.on("disconnect", () => {
    console.log(`Disconnected user: ${user.name}`);

    connectedUsers.delete(user.name);

    io.emit(`status:${user.name}`, "offline");
  })

  console.log(`Connected user: ${user.name}`);

  io.emit(`status:${user.name}`, "online");
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));