import type { RequestHandler, Response } from "express";
import { body, validationResult, matchedData, type ValidationChain } from "express-validator";
import { handleError, PromiseError } from "@packages/utils";
import prisma from "../../lib/prisma.ts";
import type { Message } from "../../generated/prisma/client.ts";
import type { User } from "../../generated/prisma/client.ts";

export const getTargetMessages: RequestHandler = async (req, res, next) => {
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
            message: { senderId: targetId }
          },
          {
            recieverUserId: targetId,
            message: { senderId: user.id }
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
            senderId: true
          },
          include: {
            sender: { select: { name: true } }
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
            senderId: true
          },
          include: {
            sender: { select: { name: true } }
          }
        }
      },
      orderBy: {
        message: {
          sentAt: "asc"
        }
      }
    }))

  if (messages instanceof PromiseError) return res.status(400).send(messages.error)

  return res.json(messages);
}

export const deleteMessages = async (messageIds: string[]) => {
  const deletedMessages = await handleError(prisma.message.updateManyAndReturn({
    where: { id: { in: messageIds } },
    data: { deletedAt: new Date() },
    omit: { senderId: true },
    include: { 
      messageToGroups: true,
      messageToUsers: true,
      sender: { select: { name: true } }
    }
  }))

  if (deletedMessages instanceof PromiseError) throw new Error(deletedMessages.error);

  const { id, messageToGroups, messageToUsers } = deletedMessages[0]!;

  const messagesToDestination = messageToUsers ?
    await prisma.messageToUser.findUnique({
      where: { messageId_recieverUserId: { messageId: id, recieverUserId: messageToUsers[0]!.recieverUserId } },
      select: { recieverUser: { select: { name: true } } }
    }) :
    await prisma.messageToGroup.findUnique({
      where: { messageId_recieverGroupId: { messageId: id, recieverGroupId: messageToGroups[0]!.recieverGroupId } },
      select: { recieverGroup: { select: { id: true } } }
    })
  
  if (!messagesToDestination) throw new Error("Code smell right here...");
  
  return {destination: messagesToDestination, deletedMessages};
}

export const updateMessage = async (messageId: string, content: string) => {
  const updatedMessage = await handleError(prisma.message.update({
    where: { id: messageId },
    data: { 
      content: content,
      editedAt: new Date()
    },
    include: {
      messageToGroups: true,
      messageToUsers: true,
      sender: { select: { name: true } }
    }
  }))

  if (updatedMessage instanceof PromiseError) throw new Error(updatedMessage.error);
  
  const { id, messageToGroups, messageToUsers } = updatedMessage;

  const messagesToDestination = messageToUsers ?
    await prisma.messageToUser.findUnique({
      where: { messageId_recieverUserId: { messageId: id, recieverUserId: messageToUsers[0]!.recieverUserId } },
      select: { recieverUser: { select: { name: true } } }
    }) :
    await prisma.messageToGroup.findUnique({
      where: { messageId_recieverGroupId: { messageId: id, recieverGroupId: messageToGroups[0]!.recieverGroupId } },
      select: { recieverGroup: { select: { id: true } } }
    })
  
  if (!messagesToDestination) throw new Error("Code smell right here...");
  
  return {destination: messagesToDestination, updatedMessage};
}


export const createMessage = async (senderId: string, content: string, reciever: { kind: "user" | "group", id: string }) => {
  const createdMessage = await handleError(prisma.message.create({ 
    data: { senderId, content },
    omit: { senderId: true },
    include: { sender: { select: { name: true } } }
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