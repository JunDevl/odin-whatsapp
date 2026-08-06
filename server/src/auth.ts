import passport from "passport";
import Jwt from "passport-jwt";
import LocalStrategy from "passport-local";

import type { User } from "../generated/prisma/client.ts";
import prisma from "../lib/prisma.ts";

import argon2 from "argon2";

export const localStrategy = new LocalStrategy.Strategy(
  {
    usernameField: "email",
    passwordField: "password"
  },
  async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) return done(null, false, { message: "Incorrect email" });

      const validated = await argon2.verify(user.password_hash, password);
      
      if (!validated) return done(null, false, { message: "Incorrect password" });

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
);

export const JWTStrategy = new Jwt.Strategy(
  {
    jwtFromRequest: Jwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env["SECRET_KEY"]!
  },
  async (jwt_payload: User, done) => {
    const { id, email } = jwt_payload;

    try {
      const user = await prisma.user.findUnique({
        where: { id, email }
      });

      if (!user) return done(null, false, { message: "User doesn't exist" });

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
});

export const JWTProtectedRoute = passport.authenticate("jwt", { session: false });