import type { RequestHandler } from "express";
import { body, validationResult, matchedData, type ValidationChain } from "express-validator";
import { handleError, PromiseError } from "@packages/utils";
import prisma from "../../lib/prisma.ts";
import type { Group, User } from "../../generated/prisma/client.ts";

const createGroupValidator: ValidationChain[] = [
  body("name")
    .trim()
    .notEmpty(),
  body("description")
    .trim()
    .optional()
]

export const createGroup: (RequestHandler | ValidationChain[])[] = [
  createGroupValidator,
  async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) return res.status(400).json(validationErrors.array());

    const data: {name: string, description: string} = matchedData(req);
    
    const createdGroup = await handleError(prisma.group.create({ data }));

    if (createdGroup instanceof PromiseError) return res.status(400).send(createdGroup.error);

    return res.sendStatus(201);
  }
]

export const updateGroup: (RequestHandler | ValidationChain[])[] = [
  createGroupValidator,
  async (req, res, next) => {


    return next();
  }
]

export const deleteGroup: RequestHandler = async (req, res, next) => {
  

  return next();
}

const joinGroupValidator: ValidationChain = body("id").trim().isUUID().notEmpty();

export const joinGroup: (RequestHandler | ValidationChain[])[] = [
  joinGroupValidator,
  async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) return res.status(400).json(validationErrors.array());

    const {id} = matchedData(req);

    const targetGroup = await handleError(prisma.group.findUnique({
      where: {id}
    }))

    if (targetGroup instanceof PromiseError) return res.status(400).send(targetGroup.error);

    if (!targetGroup) return res.sendStatus(404);

    const {id: userId} = req.user as User;

    const joinedUser = await handleError(prisma.userOfGroup.create({
      data: {
        groupId: id,
        userId
      }
    }))

    if (joinedUser instanceof PromiseError) return res.status(400).send(joinedUser.error);

    return res.sendStatus(200);
  }
]

export const getUserGroups: RequestHandler = async (req, res, next) => {


  return next();
}

export const leaveGroup: RequestHandler = async (req, res, next) => {


  return next();
}