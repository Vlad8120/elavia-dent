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

//  AUTOCOMPLETE 
app.get("/api/search/autocomplete", async (req: any, res: any) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query || query.length < 2) return res.json({ success: true, data: [] });

    const [products, clinics, services] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, title: { contains: query, mode: "insensitive" } },
        select: { id: true, title: true },
        orderBy: { views: "desc" },
        take: 5,
      }),
      prisma.clinic.findMany({
        where: { isActive: true, name: { contains: query, mode: "insensitive" } },
        select: { id: true, name: true, city: true },
        orderBy: { rating: "desc" },
        take: 3,
      }),
      prisma.service.findMany({
        where: { name: { contains: query, mode: "insensitive" } },
        select: { id: true, name: true },
        take: 3,
      }),
    ]);

    const suggestions = [
      ...products.map(p => ({ type: "product" as const, id: p.id, label: p.title })),
      ...clinics.map(c => ({ type: "clinic" as const, id: c.id, label: c.name, sub: c.city })),
      ...services.map(s => ({ type: "service" as const, id: s.id, label: s.name })),
    ];

    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, data: [] });
  }
});

//  ІНТЕЛЕКТУАЛЬНИЙ ПОШУК 
app.get("/api/search", async (req: any, res: any) => {
  try {
    const query = String(req.query.q || "").trim();
    if (!query) return res.json({ success: true, data: { products: [], clinics: [], services: [], total: 0 } });

    const [products, clinics, services] = await Promise.all([
      prisma.product.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { oblast: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { category: true, seller: { select: { id: true, name: true, city: true } } },
        orderBy: { views: "desc" },
        take: 20,
      }),
      prisma.clinic.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: { rating: "desc" },
        take: 10,
      }),
      prisma.service.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: { products, clinics, services, total: products.length + clinics.length + services.length, query },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Помилка пошуку" });
  }
});

//  AI АСИСТЕНТ ПРОКСІ через Claude
app.post("/api/ai-chat", async (req: any, res: any) => {
  try {
    const { messages = [], systemPrompt = "" } = req.body;
    const apiKey = process.env.ANTHROPIC_API_KEY || "";

    console.log(
      "ANTHROPIC KEY exists:",
      !!process.env.ANTHROPIC_API_KEY,
      "length:",
      (process.env.ANTHROPIC_API_KEY || "").length
    );

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        text: "ANTHROPIC_API_KEY не налаштовано на сервері",
      });
    }

    const cleanMessages = messages
      .filter((m: any) => m?.role !== "system" && m?.content)
      .map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content),
      }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-latest",
        max_tokens: 1000,
        system: String(systemPrompt || ""),
        messages: cleanMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Claude API error:", data);
      return res.status(response.status).json({
        success: false,
        text: data.error?.message || "Помилка Claude API",
      });
    }

    const text =
      data.content
        ?.map((part: any) => part.text || "")
        .join("")
        .trim() || "Помилка відповіді";

    res.json({ success: true, text });
  } catch (error) {
    console.error("AI chat error:", error);
    res.status(500).json({ success: false, text: "Помилка сервера" });
  }
});

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

// Messages послуг
app.get("/api/service-messages/:serviceId", auth, async (req: any, res: any) => {
  try {
    const userId = req.userId;
    const serviceId = Number(req.params.serviceId);
    const messages = await prisma.serviceMessage.findMany({
      where: { serviceId, OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: messages });
  } catch {
    res.json({ success: true, data: [] });
  }
});

app.post("/api/service-messages", auth, async (req: any, res: any) => {
  try {
    const senderId = req.userId;
    const { text, receiverId, serviceId } = req.body;
    if (!text || !receiverId || !serviceId) {
      return res.status(400).json({ success: false, message: "Заповніть всі поля" });
    }
    const message = await prisma.serviceMessage.create({
      data: { text, senderId, receiverId: Number(receiverId), serviceId: Number(serviceId) },
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

// Чати
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
        chatsMap.set(key, { key, productId: msg.productId, clinicId: msg.clinicId, product: msg.product, clinic: msg.clinic, lastMessage: msg, otherUser, unread: 0, isBuying, isClinic });
      }
      if (!msg.isRead && msg.receiverId === userId) chatsMap.get(key).unread++;
    }
    res.json({ success: true, data: Array.from(chatsMap.values()) });
  } catch {
    res.status(500).json({ success: false, message: "Помилка сервера" });
  }
});

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

app.post("/api/clinics", auth, async (req: any, res: any) => {
  try {
    const { name, description, city, oblast, address, phone, email, image, founded, doctors } = req.body;
    const clinic = await prisma.clinic.create({
      data: { name, description: description || "", city, oblast: oblast || "", address, phone, email: email || "", image: image || "🏥", founded: founded ? Number(founded) : null, doctors: Number(doctors) || 1 },
    });
    res.status(201).json({ success: true, data: clinic });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.post("/api/services", auth, async (req: any, res: any) => {
  try {
    const { name, description, priceFrom, priceTo, duration } = req.body;
    const service = await prisma.service.create({
      data: { name, description: description || "", priceFrom: Number(priceFrom), priceTo: Number(priceTo || priceFrom), duration },
    });
    res.status(201).json({ success: true, data: service });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.put("/api/products/:id", auth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    const { title, price, city } = req.body;
    const product = await prisma.product.update({ where: { id }, data: { title, price: Number(price), city } });
    res.json({ success: true, data: product });
  } catch {
    res.status(500).json({ success: false });
  }
});

app.put("/api/clinics/:id", auth, async (req: any, res: any) => {
  try {
    const id = Number(req.params.id);
    const { name, city, address, phone } = req.body;
    const clinic = await prisma.clinic.update({ where: { id }, data: { name, city, address, phone } });
    res.json({ success: true, data: clinic });
  } catch {
    res.status(500).json({ success: false });
  }
});

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