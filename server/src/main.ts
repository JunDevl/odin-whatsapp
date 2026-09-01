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
import { createMessage } from "./controllers/messagesController.ts";
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

const connectedUsers = new Map<string, Socket>();

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

io.on("connection", (socket) => {
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

    const createdMessage = await createMessage(
      user.id,
      content,
      { kind: recieverKind, id: recieverExists.id }
    );

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

  socket.on("editMessage", async (id: string, content: string, ack: AckFunction) => {
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

    const editedMessage = await handleError(prisma.message.update({
      where: { id: targetMessage.id },
      data: { 
        content: content,
        editedAt: new Date()
      },
      include: {
        messageToGroups: { select: { recieverGroup: { select: { id: true } } } },
        messageToUsers: { select: { recieverUser: { select: { name: true } } } },
        sender: { select: { name: true } }
      }
    }))

    if (editedMessage instanceof PromiseError) return ack({
      data: null,
      error: editedMessage.error
    })

    const {messageToGroups, messageToUsers, ...returnMessage} = editedMessage;

    const message = { message: returnMessage };

    const eventName = "editMessage"

    const recieverKind = messageToUsers.length > 0 ? "user" : "group";

    const recieverIdentification = recieverKind === "user" ? 
      messageToUsers[0]!.recieverUser.name :
      messageToGroups[0]!.recieverGroup.id

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

  socket.on("deleteMessage", async (id: string, ack: (...args: any) => void) => {
    const targetMessage = await handleError(prisma.message.findUnique({
      where: { id }
    }))

    if (targetMessage instanceof PromiseError) return ack({
      data: null,
      error: targetMessage.error
    });

    if (!targetMessage) return ack({
      data: null,
      error: `Message of id ${id} is non-existent`
    })

    const deletedMessage = await handleError(prisma.message.delete({
      where: { id },
      omit: { senderId: true },
      include: { 
        messageToGroups: { select: { recieverGroup: { select: { id: true } } } },
        messageToUsers: { select: { recieverUser: { select: { name: true } } } },
        sender: { select: { name: true } }
       }
    }))

    if (deletedMessage instanceof PromiseError) return ack({
      data: null,
      error: deletedMessage.error
    })

    const {messageToGroups, messageToUsers, ...returnMessage} = deletedMessage;

    const message = { message: returnMessage };

    const eventName = "deleteMessage";

    const recieverKind = messageToUsers.length > 0 ? "user" : "group";

    const recieverIdentification = recieverKind === "user" ? 
      messageToUsers[0]!.recieverUser.name :
      messageToGroups[0]!.recieverGroup.id

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

  socket.send("connected!");
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));