import { Router } from "express";

import { JWTProtectedRoute } from "../auth.ts";

import { getAttachedMessageFile, getTargetMessages } from "../controllers/messagesController.ts";

const messagesRouter = Router();
const groupsRouter = Router();
const usersRouter = Router();
const fileRouter = Router();

messagesRouter.use("/user", usersRouter);
messagesRouter.use("/group", groupsRouter);
messagesRouter.use("/file", fileRouter);

usersRouter.route("/:userName")
  .get(JWTProtectedRoute, getTargetMessages);

groupsRouter.route("/:groupId")
  .get(JWTProtectedRoute, getTargetMessages);

fileRouter.route("/:messageId")
  .get(JWTProtectedRoute, getAttachedMessageFile);

export default messagesRouter;