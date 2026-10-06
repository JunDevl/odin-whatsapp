import { Router, type RequestHandler } from "express";

import { JWTProtectedRoute } from "../auth.ts";

import { createGroup, deleteGroup, getGroup, getGroupMembers, getUserGroups, joinGroup, leaveGroup, updateGroup } from "../controllers/groupsController.ts";

const groupsRouter = Router();

groupsRouter.route("/")
  .post(JWTProtectedRoute, createGroup as RequestHandler[]);

groupsRouter.route("/:groupId")
  .all(JWTProtectedRoute)
  .get(getGroup)
  .put(updateGroup as RequestHandler[])
  .delete(deleteGroup as RequestHandler[]);

groupsRouter.route("/:groupId/members")
  .all(JWTProtectedRoute)
  .get(getGroupMembers)
  .post(joinGroup as RequestHandler[])
  .delete(leaveGroup as RequestHandler[]);

export default groupsRouter;