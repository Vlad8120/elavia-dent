import { Request, Response } from "express";
import prisma from "../prismaClient";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { city, categoryId, minPrice, maxPrice, search, sortBy } = req.query;

    const where: any = { isActive: true };

    if (city) where.city = city;
    if (categoryId) where.categoryId = Number(categoryId);
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: "insensitive" } },
        { description: { contains: String(search), mode: "insensitive" } },
      ];
    }

    let orderBy: any = { views: "desc" };
    if (sortBy === "price-asc") orderBy = { price: "asc" };
    if (sortBy === "price-desc") orderBy = { price: "desc" };
    if (sortBy === "newest") orderBy = { createdAt: "desc" };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: { category: true, seller: { select: { id: true, name: true, city: true } } },
    });

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true, seller: { select: { id: true, name: true, city: true } } },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: "Товар не знайдено" });
    }

    await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { views: { increment: 1 } },
    });

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { title, description, price, city, oblast, condition, image, categoryId, sellerId } = req.body;

    const product = await prisma.product.create({
      data: { title, description, price: Number(price), city, oblast, condition, image, categoryId: Number(categoryId), sellerId: Number(sellerId) },
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: { isActive: false },
    });
    res.json({ success: true, message: "Товар видалено" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
};