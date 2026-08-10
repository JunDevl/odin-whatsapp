import type { RequestHandler } from "express";
import { body, validationResult, matchedData, type ValidationChain } from "express-validator";
import { handleError, PromiseError } from "@packages/utils";
import prisma from "../../lib/prisma.ts";
import type { Message } from "../../generated/prisma/client.ts";
import type { User } from "../../generated/prisma/client.ts";

export const getMessages: RequestHandler = async (req, res, next) => {

  return next();
}

export const deleteMessages: RequestHandler = async (req, res, next) => {

  return next();
}

const createMessageValidator: ValidationChain[] = [
  body("content")
    .trim()
    .notEmpty()
]

export const updateMessage: (RequestHandler | ValidationChain[])[] = [
  createMessageValidator,
  async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) return res.status(400).json(validationErrors.array());

    const user = req.user as User;

    const data = matchedData(req);

    const createdMessage = await handleError(prisma.message.update({ 
      data: {
        content: data.content!
      },
      where: {
        id: "aba", // TODO: change this so the request knows the message it's referencing
        senderId: user.id
      }
    }));

    if (createdMessage instanceof PromiseError) return res.status(400).send(createdMessage.error);
    
    res.sendStatus(200);
  }
]

export const createMessage: (RequestHandler | ValidationChain[])[] = [
  createMessageValidator,
  async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) return res.status(400).json(validationErrors.array());

    const user = req.user as User;

    const data: { content: string, senderId: string } = matchedData(req);

    data.senderId = user.id!

    const createdMessage = await handleError(prisma.message.create({ data }));

    if (createdMessage instanceof PromiseError) return res.status(400).send(createdMessage.error);

    res.sendStatus(201);
  }
]