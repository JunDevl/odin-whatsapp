import type { RequestHandler } from "express";
import { body, validationResult, matchedData, type ValidationChain } from "express-validator";
import { handleError, PromiseError } from "packages/utils";
import prisma from "../../lib/prisma.ts";
import type { User } from "../../generated/prisma/client.ts";
import supabase from "../../lib/supabase.ts";

const MESSAGE_INCLUDE = {
  sender: { select: { name: true } },
  attachedFile: true
};

export const getTargetMessages: RequestHandler = async (req, res, next) => {
  const identification = String(req.params.userName ?? req.params.groupId);

  const target = req.params.userName ?
    await handleError(prisma.user.findUnique({
      where: { name: identification} ,
      select: { id: true }
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
          include: MESSAGE_INCLUDE
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
          include: MESSAGE_INCLUDE
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

export const getAttachedMessageFile: RequestHandler = async (req, res, next) => {
  const messageId = String(req.params.messageId);
  const fileName = String(req.params.fileName);

  const { data, error } = await supabase.storage.from("messages-files").download(`/${messageId}/${fileName}`);

  if (error) return res.status(400).send(error);

  if (!data) return res.sendStatus(404);

  res.type(data.type);

  const buffer = await data.arrayBuffer();

  return res.send(Buffer.from(buffer));
}

export const deleteMessages = async (messageIds: string[]) => {
  const deletedMessages = await handleError(prisma.message.updateManyAndReturn({
    where: { id: { in: messageIds } },
    data: { deletedAt: new Date() },
    omit: { senderId: true },
    include: MESSAGE_INCLUDE
  }))

  if (deletedMessages instanceof PromiseError) throw new Error(deletedMessages.error);

  if (deletedMessages.length === 0) throw new Error(`No messages of ids: ${messageIds}`);
  
  return deletedMessages;
}

export const updateMessage = async (messageId: string, content: string) => {
  const updatedMessage = await handleError(prisma.message.update({
    where: { id: messageId },
    data: { 
      content: content,
      editedAt: new Date()
    },
    include: MESSAGE_INCLUDE
  }))

  if (updatedMessage instanceof PromiseError) throw new Error(updatedMessage.error);

  if (!updatedMessage) throw new Error(`No messages of id: ${messageId}`);

  return updatedMessage;
}


export const createMessage = async (senderId: string, content: string, reciever: { kind: "user" | "group", id: string }, file: {fileName: string, sizeBytes: number} | null) => {

  const createdMessage = await handleError(prisma.message.create({ 
    data: { senderId, content, attachedFile: file ? { create: file } : undefined },
    omit: { senderId: true },
    include: MESSAGE_INCLUDE
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