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

// Middleware авторизації
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

// Messages routes
app.get("/api/messages/:productId", auth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const productId = Number(req.params.productId);
    const messages = await prisma.message.findMany({
      where: {
        productId,
        OR: [{ senderId: userId }, { receiverId: userId }],
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
});

app.post("/api/messages", auth, async (req: any, res: any) => {
  try {
    const senderId = req.userId;
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
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Elavia Dent API працює!" });
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущено на порту ${PORT}`);
});

export default app;