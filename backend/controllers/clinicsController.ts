import { Request, Response } from "express";
import prisma from "../prismaClient";

export const getClinics = async (req: Request, res: Response) => {
  try {
    const { city, search } = req.query;
    const where: any = { isActive: true };

    if (city) where.city = city;
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: "insensitive" } },
        { city: { contains: String(search), mode: "insensitive" } },
      ];
    }

    const clinics = await prisma.clinic.findMany({
      where,
      orderBy: { rating: "desc" },
      include: {
        services: { include: { service: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json({ success: true, data: clinics });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};

export const getClinicById = async (req: Request, res: Response) => {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        services: { include: { service: true } },
        reviews: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!clinic) {
      return res.status(404).json({ success: false, message: "Клініку не знайдено" });
    }

    res.json({ success: true, data: clinic });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};

export const addReview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const clinicId = Number(req.params.id);
    const { text, rating } = req.body;

    if (!text || !rating) {
      return res.status(400).json({ success: false, message: "Заповніть всі поля" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Рейтинг від 1 до 5" });
    }

    const review = await prisma.review.create({
      data: {
        text,
        rating: Number(rating),
        userId,
        clinicId,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    // Оновлюємо середній рейтинг клініки
    const reviews = await prisma.review.findMany({
      where: { clinicId },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.clinic.update({
      where: { id: clinicId },
      data: { rating: Math.round(avgRating * 10) / 10 },
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};