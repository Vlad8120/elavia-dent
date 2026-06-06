import { Request, Response } from "express";
import prisma from "../prismaClient";

export const getServices = async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" },
      include: {
        clinics: {
          include: { clinic: true },
        },
      },
    });

    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};