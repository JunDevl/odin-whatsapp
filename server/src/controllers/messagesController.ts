import type { RequestHandler } from "express";
import { body, validationResult, matchedData, type ValidationChain } from "express-validator";
import { handleError, PromiseError } from "@packages/utils";
import prisma from "../../lib/prisma.ts";
import type { Message } from "../../generated/prisma/client.ts";
import type { User } from "../../generated/prisma/client.ts";

export const getMessages: RequestHandler = async (req, res, next) => {
  const identification = String(req.params.userName ?? req.params.groupId);

  const target = req.params.userName ?
    await handleError(prisma.user.findUnique({
      where: {name: identification},
      select: {id: true}
    })) :
    {id: identification};

  if (target instanceof PromiseError) return res.status(400).send(target.error);

  if (!target) return res.status(404).send(`User of name ${identification} not found`);

  const {id: targetId} = target;

  const user = req.user as User;

  const messages = req.params.userName ?
    await handleError(prisma.messageToUser.findMany({
      where: {
        OR: [
          {
            recieverUserId: user.id,
            message: {senderId: targetId}
          },
          {
            recieverUserId: targetId,
            message: {senderId: user.id}
          }
        ]
      },
      omit: {
        messageId: true,
        recieverUserId: true
      },
      include: {
        message: {
          omit: {
            id: true,
            senderId: true
          }
        }
      },
      orderBy: {
        message: {
          sentAt: "asc"
        }
      }
    })) :
    await handleError(prisma.messageToGroup.findMany({
      where: {recieverGroupId: targetId},
      omit: {
        messageId: true,
        recieverGroupId: true
      },
      include: {
        message: {
          omit: {
            id: true,
            senderId: true
          }
        }
      },
      orderBy: {
        message: {
          sentAt: "asc"
        }
      }
    }))

  if (messages instanceof PromiseError) return res.status(400).send(messages.error);

  res.json(messages);
}

export const deleteMessages: RequestHandler = async (req, res, next) => {

  return next();
}

export const updateMessage = async (user: User, messageId: string, content: string) => {
  const updatedMessage = await handleError(prisma.message.update({ 
    data: {
      content
    },
    where: {
      id: "aba", // TODO: change this so the request knows the message it's referencing
      senderId: user.id
    }
  }));

  if (updatedMessage instanceof PromiseError) throw new Error(updatedMessage.error);
  
  return updatedMessage;
}


export const createMessage = async (senderId: string, content: string, reciever: { kind: "user" | "group", id: string }) => {
  const createdMessage = await handleError(prisma.message.create({ 
    data: {senderId, content},
    include: {sender: {select: {id: true, name: true}}}
  }));

  if (createdMessage instanceof PromiseError) throw new Error(createdMessage.error);

  const messageToDestination = reciever.kind === "user" ?
    await handleError(prisma.messageToUser.create({
      data: {
        messageId: createdMessage.id,
        recieverUserId: reciever.id
      }
    })) : 
    await handleError(prisma.messageToGroup.create({
      data: {
        messageId: createdMessage.id,
        recieverGroupId: reciever.id
      }
    }))

  if (messageToDestination instanceof PromiseError) throw new Error(messageToDestination.error);

  return createdMessage;
}