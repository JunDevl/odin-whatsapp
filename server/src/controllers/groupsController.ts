import type { RequestHandler } from "express";
import { body, validationResult, matchedData, type ValidationChain } from "express-validator";
import { handleError, PromiseError } from "@packages/utils";
import prisma from "../../lib/prisma.ts";
import type { Group } from "../../generated/prisma/client.ts";

export const deleteGroup: RequestHandler = async (req, res, next) => {
  

  return next();
}

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


    return next();
  }
]

export const updateGroup: (RequestHandler | ValidationChain[])[] = [
  createGroupValidator,
  async (req, res, next) => {


    return next();
  }
]