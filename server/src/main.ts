import express, { Router } from "express";
import { createServer } from "node:http";
import type { RequestHandler } from "express";
import cors from "cors";
import { body, matchedData, validationResult, type ValidationChain } from "express-validator";
import fs from "node:fs";
// import prisma from "../lib/prisma.ts";
import path from "node:path";
import { Server } from "socket.io";

const PORT = 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", socket => {
  console.log("connected an user")

  socket.on("message", message => {
    socket.send(message);
    socket.emit("message", message); // emits to everybody connected to the websocket
  })
})

app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const apiRouter = Router();

app.use((err: any, _: any, res: any, __: any) => {
  console.error(err.stack);
  res.send(err.message);
})

io.listen(PORT);