import { Router, type RequestHandler } from "express";

import passport from "passport";
import jwt from "jsonwebtoken";
import { JWTProtectedRoute } from "../auth.ts";

import { createUser, deleteUser, getUser, updateUser } from "../controllers/usersController.ts";

import type { User } from "../../generated/prisma/client.ts";

const usersRouter = Router();

usersRouter.route("/")
  .post(createUser as RequestHandler[]);

usersRouter.route("/auth")
  .get(JWTProtectedRoute, getUser)
  .post((req, res, next) => { // log-in and create new JWT
    passport.authenticate(
      "local", 
      { session: false }, 
      (err: string, user: User, info: any, status: string) => {
        if (err) return res.status(400).send(info);

        if (!user) return res.status(404).send(info);

        jwt.sign(user, process.env["SECRET_KEY"]!, {expiresIn: "7d"}, (err, token) => {
          if (err) return res.status(400).send(err);

    
          res.status(201).cookie("session_token", token, { httpOnly: true });
        })
      }
    )(req, res, next)
  })

usersRouter.route("/:userID")
  .all(JWTProtectedRoute)
  .get(getUser)
  .delete(deleteUser)
  .put(updateUser as RequestHandler[]);

export default usersRouter;