import express, { Router } from "express";
import cookieParser from "cookie-parser";

import cors from "cors";

import passport from "passport";
import { localStrategy } from "./auth.ts";
import { JWTStrategy } from "./auth.ts";

import usersRouter from "./routes/usersRouter.ts";
import messagesRouter from "./routes/messagesRouter.ts";
import groupsRouter from "./routes/groupsRouter.ts";

import { server, app } from "./socket-io.ts";

const PORT = 8080;
export const CLIENT_ORIGIN = "https://odin-whatsapp-client-five.vercel.app";

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
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

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

export default server;