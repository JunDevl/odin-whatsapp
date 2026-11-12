import type { CookieOptions, RequestHandler } from "express";
import { body, validationResult, matchedData, type ValidationChain } from "express-validator";
import { handleError, PromiseError } from "../../lib/utils.ts";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import prisma from "../../lib/prisma.ts";
import type { User } from "../../generated/prisma/client.ts";
import { connectedUsers } from "../index.ts";
import passport from "passport";



const USER_TOKEN_COOKIE_HEADERS: CookieOptions = 
  Object.assign<CookieOptions, CookieOptions | null>(
    { httpOnly: true }, 
    process.env["NODE_ENV"] === "production" ? { sameSite: "none", partitioned: true, secure: true } : null
  );

export const loginUser: RequestHandler = (req, res, next) => { // log-in and create new JWT
  passport.authenticate(
    "local", 
    { session: false }, 
    async (err: string, user: User, info: any, status: string) => {
      if (err) return res.status(400).send(info);

      if (!user) return res.status(404).send(info);

      try {
        const token = jwt.sign(user, process.env["SECRET_KEY"]!, {expiresIn: "7d"})
        res.cookie("session_token", token, USER_TOKEN_COOKIE_HEADERS).sendStatus(201);
      } catch (err) {
        res.status(400).send(err);
      }
    }
  )(req, res, next)
}

export const logoutUser: RequestHandler = (req, res, next) => {
  try { res.clearCookie("session_token").sendStatus(200); } 
  catch (err) { res.status(400).send(err); }
}

const createUserValidator: ValidationChain[] = [
  body("name")
    .trim()
    .not().contains(" ")
    .notEmpty(),
  body("profile_name")
    .trim()
    .notEmpty(),
  body("email")
    .trim()
    .isEmail()
    .notEmpty(),
  body("password")
    .trim()
    .notEmpty()
]

export const createUser: (RequestHandler | ValidationChain[])[] = [
  createUserValidator,
  async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) return res.status(400).json(validationErrors.array());

    const data = matchedData(req);

    const { password, ...newUser } = data; 

    const hashedPassword = await argon2.hash(password, {
      memoryCost: 65536,
      parallelism: 4,
      timeCost: 5
    })

    newUser.password_hash = hashedPassword;

    const createdUser = await handleError(prisma.user.create({ data: newUser as any }));

    if (createdUser instanceof PromiseError) return res.status(400).json(createdUser.error);
    
    try {
      const token = jwt.sign(createdUser, process.env["SECRET_KEY"]!, {expiresIn: "7d"});
      res.cookie("session_token", token, USER_TOKEN_COOKIE_HEADERS).sendStatus(200);
    } catch (e) {
      res.status(400).send(e);
    }
  }
]

export const getUser: RequestHandler = async (req, res) => {
  const {id, password_hash, ...user} = req.user as User;

  res.json(user);
}

const updateUserValidator: ValidationChain[] = [
  body("profile_name")
    .trim()
    .optional(),
  body("email")
    .trim()
    .isEmail()
    .optional(),
  body("password")
    .trim()
    .optional()
]

export const updateUser: (RequestHandler | ValidationChain[])[] = [
  updateUserValidator,
  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) return res.status(400).json(validationErrors.array());

    const data = matchedData(req);

    const updateUser = data;

    if (updateUser.password) {
      const hashedPassword = await argon2.hash(updateUser.password, {
        memoryCost: 65536,
        parallelism: 4,
        timeCost: 5
      })

      updateUser.password_hash = hashedPassword;
    }

    const {id} = req.user as User;

    const updatedUser = await prisma.user.update({
      data: updateUser,
      where: { id }
    })

    if (updatedUser instanceof PromiseError) return res.status(400).json(updatedUser.error);

    try {
      const token = jwt.sign(updatedUser, process.env["SECRET_KEY"]!, {expiresIn: "7d"});
      res.cookie("session_token", token, USER_TOKEN_COOKIE_HEADERS).sendStatus(200);
    } catch (e) {
      res.status(400).send(e);
    }
  }
]

export const deleteUser: RequestHandler = async (req, res) => {
  const {id} = req.user as User;

  const deletedUser = await prisma.user.delete({
    where: { id }
  })

  if (deletedUser instanceof PromiseError) return res.status(400).json(deletedUser.error);

  return res.sendStatus(200);
}

export const getUserFriends: RequestHandler = async (req, res) => {
  const {id} = req.user as User;

  const userFriendsData = await handleError(prisma.user.findUnique({
    where: { id },
    select: {
      originUserFriend: { select: { friendUser: { select: { name: true, profile_name: true } } } }
    }
  }))

  if (userFriendsData instanceof PromiseError) return res.status(400).send(userFriendsData.error);

  const userFriends = userFriendsData ?
    userFriendsData.originUserFriend.map(friend => {
      const friendWithStatus = {
        ...friend,
        status: connectedUsers.has(friend.friendUser.name) ? "online" : "offline"
      } as const

      return friendWithStatus;
    }) 
  : [];

  return res.json(userFriends);
}

const addFriendValidator: ValidationChain[] = [
  body("name")
    .trim()
    .not().contains(" ")
    .notEmpty()
]

export const addUserFriend: (RequestHandler | ValidationChain[])[] = [
  addFriendValidator,
  async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) return res.status(400).json(validationErrors.array());

    const {id} = req.user as User;

    const {name} = matchedData(req);

    const targetFriendUser = await handleError(prisma.user.findUnique({ 
      where: { name },
      select: { id: true }
    }))

    if (targetFriendUser instanceof PromiseError) return res.status(400).send(targetFriendUser.error);

    if (!targetFriendUser) return res.status(404).send(`There is no user of name ${name}.`);

    const addedFriend = await handleError(prisma.friendOfUser.create({
      data: {
        originUserId: id,
        friendUserId: targetFriendUser.id
      }
    }))

    if (addedFriend instanceof PromiseError) return res.status(400).send(addedFriend.error);

    return res.sendStatus(200);
  }
]

export const removeUserFriend: RequestHandler = async (req, res, next) => {
  const {id} = req.user as User;

  const name = String(req.params.friendName);

  const targetFriendUser = await handleError(prisma.user.findUnique({ 
    where: { name },
    select: { id: true }
  }))

  if (targetFriendUser instanceof PromiseError) return res.status(400).send(targetFriendUser.error);

  if (!targetFriendUser) return res.status(404).send(`There is no user of name ${name}.`);

  const removedFriend = await handleError(prisma.friendOfUser.delete({
    where: {
      originUserId_friendUserId: {
        originUserId: id,
        friendUserId: targetFriendUser.id
      }
    }
  }))

  if (removedFriend instanceof PromiseError) return res.status(400).send(removedFriend.error);

  return res.sendStatus(200);
}