import { Router, type RequestHandler } from "express";

import passport from "passport";
import jwt from "jsonwebtoken";
import { JWTProtectedRoute } from "../auth.ts";

import { addUserFriend, createUser, deleteUser, getUser, getUserFriends, removeUserFriend, updateUser } from "../controllers/usersController.ts";

import type { User } from "../../generated/prisma/client.ts";
import { getMessages } from "../controllers/messagesController.ts";

const messagesRouter = Router();
const groupsRouter = Router();
const usersRouter = Router();

messagesRouter.use("/user", usersRouter);
messagesRouter.use("/group", groupsRouter);

usersRouter.route("/:userName")
  .get(JWTProtectedRoute, getMessages);

export default messagesRouter;