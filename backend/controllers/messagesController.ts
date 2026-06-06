import { Request, Response } from "express";
import prisma from "../prismaClient";

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const productId = Number(req.params.productId);

    const messages = await prisma.message.findMany({
      where: {
        productId,
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = (req as any).userId;
    const { text, receiverId, productId } = req.body;

    if (!text || !receiverId || !productId) {
      return res.status(400).json({ success: false, message: "Заповніть всі поля" });
    }

    const message = await prisma.message.create({
      data: {
        text,
        senderId,
        receiverId: Number(receiverId),
        productId: Number(productId),
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};