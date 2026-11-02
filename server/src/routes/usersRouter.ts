import { Router, type RequestHandler } from "express";

import passport from "passport";
import jwt from "jsonwebtoken";
import { JWTProtectedRoute } from "../auth.ts";

import { addUserFriend, createUser, deleteUser, getUser, getUserFriends, loginUser, logoutUser, removeUserFriend, updateUser } from "../controllers/usersController.ts";

import type { User } from "../../generated/prisma/client.ts";
import { getUserGroups } from "../controllers/groupsController.ts";

const usersRouter = Router();

usersRouter.route("/")
  .post(createUser as RequestHandler[])
  .delete(JWTProtectedRoute, deleteUser)
  .put(JWTProtectedRoute, updateUser as RequestHandler[])
  .get(JWTProtectedRoute, getUser); // get user from jwt stored in the client's cookies

usersRouter.route("/auth")
  .post(loginUser)
  .delete(logoutUser);

const friendsRouter = Router();

usersRouter.use("/friends", friendsRouter);

friendsRouter.route("/")
  .all(JWTProtectedRoute)
  .post(addUserFriend as RequestHandler[])
  .get(getUserFriends);

friendsRouter.route("/:friendName")
  .delete(JWTProtectedRoute, removeUserFriend);

const groupsRouter = Router();

usersRouter.use("/groups", groupsRouter);

groupsRouter.route("/")
  .get(JWTProtectedRoute, getUserGroups);

export default usersRouter;