import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import productsRouter from "./routes/products";
import clinicsRouter from "./routes/clinics";
import servicesRouter from "./routes/services";
import authRouter from "./routes/auth";
import categoriesRouter from "./routes/categories";
import prisma from "./prismaClient";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "elavia_dent_secret_key_2025";

app.use(cors());
app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/clinics", clinicsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);

function auth(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ success: false, message: "Токен не надано" });
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Невірний токен" });
  }
}

// Messages товарів
app.get("/api/messages/:productId", auth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const productId = Number(req.params.productId);
    const messages = await prisma.message.findMany({
      where: { productId, OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: messages });
  } catch {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});

app.post("/api/messages", auth, async (req: any, res: any) => {
  try {
    const senderId = req.userId;
    const { text, receiverId, productId } = req.body;
    if (!text || !receiverId || !productId) {
      return res.status(400).json({ success: false, message: "Заповніть всі поля" });
    }
    const message = await prisma.message.create({
      data: { text, senderId, receiverId: Number(receiverId), productId: Number(productId) },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
    res.status(201).json({ success: true, data: message });
  } catch {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});

// Messages клінік
app.get("/api/clinic-messages/:clinicId", auth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const clinicId = Number(req.params.clinicId);
    const messages = await prisma.message.findMany({
      where: { clinicId, OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: messages });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/api/clinic-messages", auth, async (req: any, res: any) => {
  try {
    const senderId = req.userId;
    const { text, receiverId, clinicId } = req.body;
    if (!text || !receiverId || !clinicId) {
      return res.status(400).json({ success: false, message: "Заповніть всі поля" });
    }
    const message = await prisma.message.create({
      data: { text, senderId, receiverId: Number(receiverId), clinicId: Number(clinicId) },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
    res.status(201).json({ success: true, data: message });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Чати (товари + клініки)
app.get("/api/chats", auth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const messages = await prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
        product: { select: { id: true, title: true, image: true, price: true, sellerId: true } },
        clinic: { select: { id: true, name: true, image: true, city: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const chatsMap = new Map();
    for (const msg of messages) {
      const key = msg.clinicId ? `clinic_${msg.clinicId}` : `product_${msg.productId}`;
      if (!chatsMap.has(key)) {
        const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
        const isBuying = msg.product ? msg.product.sellerId !== userId : true;
        const isClinic = !!msg.clinicId;
        chatsMap.set(key, {
          key,
          productId: msg.productId,
          clinicId: msg.clinicId,
          product: msg.product,
          clinic: msg.clinic,
          lastMessage: msg,
          otherUser,
          unread: 0,
          isBuying,
          isClinic,
        });
      }
      if (!msg.isRead && msg.receiverId === userId) {
        chatsMap.get(key).unread++;
      }
    }

    res.json({ success: true, data: Array.from(chatsMap.values()) });
  } catch {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});

// Прочитати повідомлення
app.put("/api/messages/read/:productId", auth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const productId = Number(req.params.productId);
    await prisma.message.updateMany({
      where: { productId, receiverId: userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});

// Оновити товар
app.put("/api/products/:id", auth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    const { title, price, city } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: { title, price: Number(price), city },
    });
    res.json({ success: true, data: product });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Оновити клініку
app.put("/api/clinics/:id", auth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    const { name, city, address, phone } = req.body;
    const clinic = await prisma.clinic.update({
      where: { id },
      data: { name, city, address, phone },
    });
    res.json({ success: true, data: clinic });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Видалити клініку
app.delete("/api/clinics/:id", auth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    await prisma.clinicService.deleteMany({ where: { clinicId: id } });
    await prisma.review.deleteMany({ where: { clinicId: id } });
    await prisma.favorite.deleteMany({ where: { clinicId: id } });
    await prisma.message.deleteMany({ where: { clinicId: id } });
    await prisma.clinic.delete({ where: { id } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Список користувачів
app.get("/api/auth/users", auth, async (req: any, res: any) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, blocked: true, city: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: users });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Заблокувати/розблокувати
app.put("/api/auth/users/:id/block", auth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    const { blocked } = req.body;
    await prisma.user.update({ where: { id }, data: { blocked } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

// Історія цін
app.post("/api/price-history/:productId", async (req: any, res: any) => {
  try {
    const productId = Number(req.params.productId);
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ success: false });
    await prisma.priceHistory.create({ data: { productId, price: product.price } });
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get("/api/price-history/:productId", async (req: any, res: any) => {
  try {
    const productId = Number(req.params.productId);
    const history = await prisma.priceHistory.findMany({
      where: { productId },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: history });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get("/api/analytics/product/:productId", async (req: any, res: any) => {
  try {
    const productId = Number(req.params.productId);
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { priceHistory: { orderBy: { createdAt: "asc" } }, category: true },
    });
    if (!product) return res.status(404).json({ success: false });
    const prices = product.priceHistory.map(h => h.price);
    const allPrices = [...prices, product.price];
    res.json({
      success: true,
      data: {
        id: product.id, title: product.title, currentPrice: product.price,
        minPrice: Math.min(...allPrices), maxPrice: Math.max(...allPrices),
        avgPrice: Math.round(allPrices.reduce((s, p) => s + p, 0) / allPrices.length),
        history: product.priceHistory, category: product.category,
      },
    });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get("/api/analytics/category/:categoryId", async (req: any, res: any) => {
  try {
    const categoryId = Number(req.params.categoryId);
    const products = await prisma.product.findMany({
      where: categoryId ? { categoryId } : {},
      include: { priceHistory: { orderBy: { createdAt: "asc" } }, category: true },
    });
    const result = products.map(p => ({
      id: p.id, title: p.title, currentPrice: p.price,
      minPrice: p.priceHistory.length > 0 ? Math.min(...p.priceHistory.map(h => h.price)) : p.price,
      maxPrice: p.priceHistory.length > 0 ? Math.max(...p.priceHistory.map(h => h.price)) : p.price,
      avgPrice: p.priceHistory.length > 0 ? Math.round(p.priceHistory.reduce((s, h) => s + h.price, 0) / p.priceHistory.length) : p.price,
      history: p.priceHistory, category: p.category,
    }));
    res.json({ success: true, data: result });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Elavia Dent API працює!" });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущено на порту ${PORT}`);
});

export default app;