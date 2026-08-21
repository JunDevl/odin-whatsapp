import { Router, type RequestHandler } from "express";

import { JWTProtectedRoute } from "../auth.ts";

import { addUserFriend, createUser, deleteUser, getUser, getUserFriends, removeUserFriend, updateUser } from "../controllers/usersController.ts";

import { createGroup, deleteGroup, getUserGroups, joinGroup, leaveGroup, updateGroup } from "../controllers/groupsController.ts";

const groupsRouter = Router();

groupsRouter.route("/")
  .all(JWTProtectedRoute)
  .post(createGroup as RequestHandler[])
  .put(updateGroup as RequestHandler[])
  .delete(deleteGroup);

export default groupsRouter;