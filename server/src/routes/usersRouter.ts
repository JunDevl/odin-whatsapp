import { Router, type RequestHandler } from "express";

import passport from "passport";
import jwt from "jsonwebtoken";
import { JWTProtectedRoute } from "../auth.ts";

import { addUserFriend, createUser, deleteUser, getUser, getUserFriends, removeUserFriend, updateUser } from "../controllers/usersController.ts";

import type { User } from "../../generated/prisma/client.ts";

const usersRouter = Router();

usersRouter.route("/")
  .post(createUser as RequestHandler[])
  .delete(JWTProtectedRoute, deleteUser)
  .put(JWTProtectedRoute, updateUser as RequestHandler[])
  .get(JWTProtectedRoute, getUser); // get user from jwt stored in the client's cookies

usersRouter.route("/auth")
  .post((req, res, next) => { // log-in and create new JWT
    passport.authenticate(
      "local", 
      { session: false }, 
      (err: string, user: User, info: any, status: string) => {
        if (err) return res.status(400).send(info);

        if (!user) return res.status(404).send(info);

        jwt.sign(user, process.env["SECRET_KEY"]!, {expiresIn: "7d"}, (err, token) => {
          if (err) return res.status(400).send(err);
    
          res.cookie("session_token", token/*, { httpOnly: true }*/).sendStatus(201);
        })
      }
    )(req, res, next)
  })

usersRouter.route("/friends")
  .get(JWTProtectedRoute, getUserFriends)
  .post(JWTProtectedRoute, addUserFriend as RequestHandler[])

usersRouter.route("/friends/:friendName")
  .delete(JWTProtectedRoute, removeUserFriend);

export default usersRouter;