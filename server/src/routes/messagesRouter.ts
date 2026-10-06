import { Router, type RequestHandler } from "express";

import { JWTProtectedRoute } from "../auth.ts";

import { getTargetMessages } from "../controllers/messagesController.ts";

const messagesRouter = Router();
const groupsRouter = Router();
const usersRouter = Router();

messagesRouter.use("/user", usersRouter);
messagesRouter.use("/group", groupsRouter);

usersRouter.route("/:userName")
  .get(JWTProtectedRoute, getTargetMessages);

groupsRouter.route("/:groupId")
  .get(JWTProtectedRoute, getTargetMessages);

export default messagesRouter;