import type { RequestHandler } from "express";
import { param, body, validationResult, matchedData, type ValidationChain } from "express-validator";
import { handleError, PromiseError } from "@packages/utils";
import prisma from "../../lib/prisma.ts";
import type { Group, User } from "../../generated/prisma/client.ts";
import { connectedUsers } from "../main.ts";

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

    const {name, description}: {name: string, description?: string} = matchedData(req);

    const user = req.user as User;
    
    const createdGroup = await handleError(prisma.group.create({ 
      data: {
        name,
        description: description ?? null,
        members: { create: { userId: user.id, authority: "owner" } }
      }
    }));

    if (createdGroup instanceof PromiseError) return res.status(400).send(createdGroup.error);

    return res.sendStatus(201);
  }
]

const groupIdValidator: ValidationChain = param("groupId").trim().isUUID().notEmpty();

export const updateGroup: (RequestHandler | ValidationChain[])[] = [
  groupIdValidator,
  createGroupValidator,
  async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) return res.status(400).json(validationErrors.array());

    const {id, name, description}: {id: string, name: string, description: string} = matchedData(req);

    const data = { name, description };
    
    const createdGroup = await handleError(prisma.group.update({ data, where: { id } }));

    if (createdGroup instanceof PromiseError) return res.status(400).send(createdGroup.error);

    return res.sendStatus(201);
  }
]

export const deleteGroup: (RequestHandler | ValidationChain[])[] = [
  groupIdValidator,
  async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) return res.status(400).json(validationErrors.array());

    const {id} = matchedData(req);

    const targetGroup = await handleError(prisma.group.findUnique({ where: id }));

    if (targetGroup instanceof PromiseError) return res.status(400).send(targetGroup.error);

    if (!targetGroup) return res.status(404).send(`No group of id ${id} found`);

    const deletedGroup = await handleError(prisma.group.delete({ where: { id } }));

    if (deletedGroup instanceof PromiseError) return res.status(400).send(deletedGroup.error);

    return res.sendStatus(200);
}]

export const joinGroup: (RequestHandler | ValidationChain[])[] = [
  groupIdValidator,
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

    const joinedUser = await handleError(prisma.memberOfGroup.create({
      data: {
        groupId: id,
        userId,
        authority: "member"
      }
    }))

    if (joinedUser instanceof PromiseError) return res.status(400).send(joinedUser.error);

    return res.sendStatus(200);
  }
]

export const leaveGroup: (RequestHandler | ValidationChain[])[] = [
  groupIdValidator,
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

    const leftOutUser = await handleError(prisma.memberOfGroup.delete({
      where: {
        userId_groupId: {
          groupId: id,
          userId
        }
      }
    }))

    if (leftOutUser instanceof PromiseError) return res.status(400).send(leftOutUser.error);

    return res.sendStatus(200);
}]

export const getUserGroups: RequestHandler = async (req, res, next) => {
  const {id} = req.user as User;

  const userGroupsData = await handleError(prisma.user.findUnique({
    where: { id },
    select: { 
      groups: { 
        select: { 
          group: true
        } 
      } 
    }
  }))

  if (userGroupsData instanceof PromiseError) return res.status(400).send(userGroupsData.error);

  if (!userGroupsData) return res.json([]);

  return res.json(userGroupsData.groups);
}

export const getGroupMembers: RequestHandler = async (req, res, next) => {
  const id = String(req.params.groupId);

  const members = await handleError(prisma.group.findUnique({
    where: { id },
    select: { 
      members: { 
        omit: { userId: true },
        include: { 
          user: { 
            select: { 
              name: true, 
              profile_name: true 
            }
          }
        },
        orderBy: { user: { profile_name: "asc" } }
      } 
    }
  }))

  if (members instanceof PromiseError) return res.status(400).send(members.error);

  const groupMembers = members ?
      members.members.map(member => {
        const friendWithStatus = {
          ...member,
          status: connectedUsers.has(member.user.name) ? "online" : "offline"
        } as const
  
        return friendWithStatus;
      }) 
    : [];

  return res.json(groupMembers);
}