import type { RequestHandler } from "express";
import { body, validationResult, matchedData, type ValidationChain } from "express-validator";
import { handleError, PromiseError } from "@packages/utils";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import prisma from "../../lib/prisma.ts";
import type { User } from "../../generated/prisma/client.ts";

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
    
    jwt.sign(createdUser, process.env["SECRET_KEY"]!, {expiresIn: "7d"}, (err, token) => {
      if (err) return res.status(400).send(err);

      res.cookie("session_token", token, { httpOnly: true }).sendStatus(200);
    })
  }
]

export const getUser: RequestHandler = async (req, res) => {
  const userID = String(req.params.userID ?? "");

  const user = req.user as User

  let foundUser = 
    userID ? 
    await prisma.user.findUnique({ where: { id: userID } }) : 
    req.user as Partial<User>;

  if (!foundUser) return res.sendStatus(404);

  res.json(foundUser);
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

    const id = String(req.params.userID);

    const updatedUser = await prisma.user.update({
      data: updateUser,
      where: { id }
    })

    if (updatedUser instanceof PromiseError) return res.status(400).json(updatedUser.error);

    jwt.sign(updatedUser, process.env["SECRET_KEY"]!, {expiresIn: "7d"}, (err, token) => {
      if (err) return res.status(400).send(err);

      res.cookie("session_token", token, { httpOnly: true }).sendStatus(200);
    })
  }
]

export const deleteUser: RequestHandler = async (req, res) => {
  const id = String(req.params.userID);

  const deletedUser = await prisma.user.delete({
    where: { id }
  })

  if (deletedUser instanceof PromiseError) return res.status(400).json(deletedUser.error);

  return res.sendStatus(200);
}

/*
  {
    "user": {
        "id": "1a180aa3-3a87-40bb-a52c-263e15bf5401",
        "name": "Aroldo Medina",
        "email": "aroldo.medina@gmail.com",
        "password": "$argon2id$v=19$m=65536,t=5,p=4$WKm5gDnh5ZsBxoCvofxYCg$cw8xJn8oCpwKKll+PxJGDtpReJcQPDwRIPX8e6VBZLU",
        "kind": "reader"
    },
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjlmZmQ3ZTI1LTYwNmEtNDY5NS04OTliLWE2OTliZmJjMTNhOSIsIm5hbWUiOiJBcm9sZG8gTWVkaW5hIiwiZW1haWwiOiJhcm9sZG8ubWVkaW5hQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTUscD00JDJWamNyS1Q5azNSUGxyY1RHVVVWZmckdFdsODA1REtlZUxndU5qZ013VWdZN0JLVDFVS093YkhCckFiVThGN1lhayIsImtpbmQiOiJyZWFkZXIiLCJpYXQiOjE3ODM3OTkzNTUsImV4cCI6MTc4NDQwNDE1NX0.CHc3A118VIm4vqwoLnZ_GN-y7IwzzC4bnXN1AwLbrzQ"
  }



  {
    "user": {
        "id": "62880c91-a3db-457c-b19c-32c7f221cddb",
        "name": "Juninho Pedone",
        "email": "juninhoplay.pedone@gmail.com",
        "password": "$argon2id$v=19$m=65536,t=5,p=4$L2/dwP/tyeDFclz4v7IZ0A$Ak1wztmxBCz7lqW//6ctDMJwjVz61usFWzmILVF9M8I",
        "kind": "admin"
    },
    "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYyODgwYzkxLWEzZGItNDU3Yy1iMTljLTMyYzdmMjIxY2RkYiIsIm5hbWUiOiJKdW5pbmhvIFBlZG9uZSIsImVtYWlsIjoianVuaW5ob3BsYXkucGVkb25lQGdtYWlsLmNvbSIsInBhc3N3b3JkIjoiJGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTUscD00JEwyL2R3UC90eWVERmNsejR2N0laMEEkQWsxd3p0bXhCQ3o3bHFXLy82Y3RETUp3alZ6NjF1c0ZXem1JTFZGOU04SSIsImtpbmQiOiJyZWFkZXIiLCJpYXQiOjE3ODM0NjUzMjEsImV4cCI6MTc4NDA3MDEyMX0.tGp9yoN_yXRz5X3IapZAaiuRYKrTuUixC-chO61MT5Q"
  }
*/