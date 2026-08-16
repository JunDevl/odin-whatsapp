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
import { Server } from "socket.io";

import passport from "passport";
import { localStrategy } from "./auth.ts";
import { JWTStrategy } from "./auth.ts";

import usersRouter from "./routes/usersRouter.ts";
import type { User } from "../generated/prisma/client.ts";
import { generateUserFriendRoom } from "./utils.ts";
import { handleError, PromiseError } from "@packages/utils";
import prisma from "../lib/prisma.ts";
import { createMessage } from "./controllers/messagesController.ts";
import messagesRouter from "./routes/messagesRouter.ts";

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

app.use((err: any, _: any, res: any, __: any) => {
  console.error(err.stack);
  res.send(`Message: ${err.message}\n\nStack: ${err.stack}`);
})

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
  cookie: true
});

const connectedUsers = new Map<string, string>();

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

io.on("connection", (socket) => {
  const user = socket.data.user as User;

  connectedUsers.set(user.name, socket.id);

  socket.on("userMessage", async (
    content: string, 
    reciever: { kind: "user", name: string } | { kind: "group", id: string },
    ack
  ) => {
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

    if (recieverExists instanceof PromiseError) throw new Error(recieverExists.error);

    if (!recieverExists) return socket.send(`Reciever (${recieverKind}) ${recieverIdentification} doesn't exist.`);

    const {sender, id, senderId, ...createdMessage} = await createMessage(
      user.id, 
      content, 
      {kind: recieverKind, id: recieverExists.id}
    );

    let roomName: string;

    if (recieverKind === "group") roomName = recieverIdentification;
    else {
      roomName = generateUserFriendRoom(user.name, recieverIdentification);

      const connectedReciever = connectedUsers.get(recieverIdentification);

      if (connectedReciever) {
        const recieverSocket = io.sockets.sockets.get(connectedReciever)!;

        // const joinedRoom: string | string[] | null = recieverSocket.rooms.;
  
        if (!recieverSocket.rooms.has(roomName)) recieverSocket.join(roomName);
      }
    }

    if (!socket.rooms.has(roomName)) socket.join(roomName);

    const message = { message: createdMessage };

    io.to(roomName).emit(
      "recievedMessage", 
      message, 
      {
        [recieverKind === "user" ? "name" : "id"]: recieverIdentification
      }
    );

    ack(message);
  })

  // socket.on("message", message => {
  //   message = message ?? "[empty]";

  //   socket.send(`SERVER ### Recieved message: "${message}" ### SERVER`);
  //   socket.emit(`SERVER ### Emitted message: "${message}" ### SERVER`); // emits to everybody connected to the websocket
  // })

  socket.send("connected!");
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));