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

app.use((err: any, _: any, res: any, __: any) => {
  console.error(err.stack);
  res.send(`Message: ${err.message}\n\nStack: ${err.stack}`);
})

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true },
  cookie: true
});

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

  socket.on("message", message => {
    message = message ?? "[empty]"

    socket.send(`SERVER ### Recieved message: "${message}" ### SERVER`);
    socket.emit(`SERVER ### Emitted message: "${message}" ### SERVER`); // emits to everybody connected to the websocket
  })

  socket.send("connected!");
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));