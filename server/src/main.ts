import express, { Router } from "express";
import type { RequestHandler } from "express";
import { body, matchedData, validationResult, type ValidationChain } from "express-validator";
import cookieParser from "cookie-parser";
import cookie from "cookie";

import { createServer } from "node:https";
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

const PORT = 8080;
const CERT_DIR = path.resolve(process.cwd(), 'certs');

const tlscert = {
  key: fs.readFileSync(path.join(CERT_DIR, 'server-key.pem')),
  cert: fs.readFileSync(path.join(CERT_DIR, 'server-cert.pem'))
}

const app = express();
const server = createServer(tlscert, app);
const io = new Server(server, {
  cors: { origin: "*" },
  cookie: true
});

io.use((socket, next) => {
  try {
    const rawCookies = socket.handshake.headers.cookie;
    if (!rawCookies) return next(new Error('No cookies sent'));

    const parsed = cookie.parse(rawCookies);
    const token = parsed.access_token;
    if (!token) return next(new Error('Not authenticated'));

    const payload = jwt.verify(token, process.env["SECRET_KEY"]!);
    socket.data.user = payload; // attach identity to the socket
    next();
  } catch (err) {
    next(new Error('Invalid or expired token'));
  }
});

io.on("connection", socket => {
  // const sessionId = socket.request["session_token"];
  socket.on("message", message => {
    message = message ?? "[empty]"
    socket.send(`SERVER ### ${message} ### SERVER`);
    socket.emit(`SERVER ### ${message} ### SERVER`); // emits to everybody connected to the websocket
  })

  socket.send("connected!");
})

// io.on("upgrade", (req, socket, head) => {
//   authenticateUpgrade(req, (err, user) => {
//     if (err) {
//       socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
//       socket.destroy();
//       return;
//     }
//     wss.handleUpgrade(req, socket, head, (ws) => {
//       ws.user = user; // attach identity to the socket
//       wss.emit('connection', ws, req);
//     });
//   });
// })

app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const apiRouter = Router();

// passport.use(localStrategy);
// passport.use(JWTStrategy);

app.use("/api", apiRouter);

apiRouter.use("/users", usersRouter);

app.use((err: any, _: any, res: any, __: any) => {
  console.error(err.stack);
  res.send(`Message: ${err.message}\n\nStack: ${err.stack}`);
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));