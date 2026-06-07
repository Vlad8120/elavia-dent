const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const connectionString = process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/elavia_dent";

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Починаємо заповнення бази даних...");
  console.log("Підключення до:", connectionString.substring(0, 50) + "...");

  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "equipment" }, update: {}, create: { name: "Стоматологічне обладнання", icon: "🦷", slug: "equipment" } }),
    prisma.category.upsert({ where: { slug: "materials" }, update: {}, create: { name: "Витратні матеріали", icon: "💊", slug: "materials" } }),
    prisma.category.upsert({ where: { slug: "instruments" }, update: {}, create: { name: "Інструменти", icon: "🔧", slug: "instruments" } }),
    prisma.category.upsert({ where: { slug: "implants" }, update: {}, create: { name: "Імплантати", icon: "⚙️", slug: "implants" } }),
    prisma.category.upsert({ where: { slug: "prosthetics" }, update: {}, create: { name: "Протезування", icon: "🦴", slug: "prosthetics" } }),
    prisma.category.upsert({ where: { slug: "orthodontics" }, update: {}, create: { name: "Ортодонтія", icon: "📐", slug: "orthodontics" } }),
    prisma.category.upsert({ where: { slug: "anesthesia" }, update: {}, create: { name: "Анестезія", icon: "💉", slug: "anesthesia" } }),
    prisma.category.upsert({ where: { slug: "disinfection" }, update: {}, create: { name: "Дезінфекція", icon: "🧴", slug: "disinfection" } }),
  ]);

  console.log("✅ Категорії створено");

  const hashedPassword = await bcrypt.hash("password123", 10);

  const seller1 = await prisma.user.upsert({
    where: { email: "medtech@elavia-dent.ua" },
    update: {},
    create: { name: "МедТех Постач", email: "medtech@elavia-dent.ua", password: hashedPassword, role: "SELLER", city: "Київ" },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: "dentexpert@elavia-dent.ua" },
    update: {},
    create: { name: "ДентаЕксперт", email: "dentexpert@elavia-dent.ua", password: hashedPassword, role: "SELLER", city: "Львів" },
  });

  const seller3 = await prisma.user.upsert({
    where: { email: "stomaservis@elavia-dent.ua" },
    update: {},
    create: { name: "Стома Сервіс", email: "stomaservis@elavia-dent.ua", password: hashedPassword, role: "SELLER", city: "Одеса" },
  });

  await prisma.user.upsert({
    where: { email: "admin@elavia-dent.ua" },
    update: {},
    create: { name: "Кнюх Владислав", email: "admin@elavia-dent.ua", password: hashedPassword, role: "ADMIN", city: "Київ" },
  });

  console.log("✅ Користувачі створено");

  const productsData = [
    { title: "Стоматологічна установка KAVO Estetica E70", description: "Сучасна установка преміум класу. Турбінний наконечник, мікромотор, скалер. Гарантія 2 роки.", price: 285000, city: "Київ", oblast: "Київська", condition: "NEW", image: "🦷", views: 342, categoryId: categories[0].id, sellerId: seller1.id },
    { title: "Рентген-апарат Planmeca ProMax 3D", description: "Цифровий панорамний рентген з функцією 3D томографії. Мінімальна доза опромінення.", price: 420000, city: "Львів", oblast: "Львівська", condition: "NEW", image: "📡", views: 218, categoryId: categories[0].id, sellerId: seller2.id },
    { title: "Фотополімерна лампа Woodpecker LED.F", description: "Бездротова LED лампа для полімеризації. Потужність 1500 мВт/см². Час роботи 8 год.", price: 8500, city: "Дніпро", oblast: "Дніпропетровська", condition: "NEW", image: "💡", views: 431, categoryId: categories[0].id, sellerId: seller1.id },
    { title: "Автоклав Melag Vacuklav 31B+", description: "Вакуумний паровий автоклав клас B. Обʼєм камери 17л. Сертифіковано.", price: 96000, city: "Вінниця", oblast: "Вінницька", condition: "NEW", image: "⚗️", views: 156, categoryId: categories[7].id, sellerId: seller1.id },
    { title: "Стоматологічне крісло A-Dec 300", description: "Крісло в відмінному стані 2022 рік. Гідравліка + електрика. Обшивка шкіра.", price: 145000, city: "Запоріжжя", oblast: "Запорізька", condition: "USED", image: "🪑", views: 312, categoryId: categories[0].id, sellerId: seller3.id },
    { title: "Набір ендодонтичних файлів ProTaper Next", description: "Набір ротаційних нікель-титанових файлів. Розміри X1-X5. 6 упаковок.", price: 4800, city: "Одеса", oblast: "Одеська", condition: "NEW", image: "🔧", views: 567, categoryId: categories[2].id, sellerId: seller3.id },
    { title: "Турбінний наконечник NSK PanaMax2", description: "Високошвидкісний наконечник з підсвічуванням. 5 точок підведення води.", price: 12800, city: "Львів", oblast: "Львівська", condition: "NEW", image: "🔬", views: 445, categoryId: categories[2].id, sellerId: seller2.id },
    { title: "Компомер Dyract XP 20 шт", description: "Компомер для реставрації зубів. 20 картриджів по 0.25г.", price: 3200, city: "Харків", oblast: "Харківська", condition: "NEW", image: "💊", views: 289, categoryId: categories[1].id, sellerId: seller3.id },
    { title: "Артикуляційна папір Bausch 200мкм", description: "Для визначення оклюзійних контактів. 300 листів.", price: 380, city: "Полтава", oblast: "Полтавська", condition: "NEW", image: "📄", views: 712, categoryId: categories[1].id, sellerId: seller1.id },
    { title: "Імплантати Nobel Biocare Active 5 шт", description: "Титанові зубні імплантати з покриттям TiUnite. Розміри 4.3×10мм.", price: 52000, city: "Київ", oblast: "Київська", condition: "NEW", image: "⚙️", views: 198, categoryId: categories[3].id, sellerId: seller2.id },
    { title: "Ортодонтичні брекети 3M Clarity", description: "Керамічні самолігуючі брекети. Комплект на 10 пацієнтів.", price: 28000, city: "Одеса", oblast: "Одеська", condition: "NEW", image: "📐", views: 134, categoryId: categories[5].id, sellerId: seller2.id },
    { title: "Анестетик Ubistesini 4% 50 карпул", description: "Карпульний анестетик з артикаїном 4%. Термін придатності до 2027.", price: 2100, city: "Дніпро", oblast: "Дніпропетровська", condition: "NEW", image: "💉", views: 890, categoryId: categories[6].id, sellerId: seller3.id },
    { title: "Цифровий інтраоральний сканер 3Shape", description: "Професійний сканер для цифрового відбитку. Точність 5 мкм.", price: 380000, city: "Київ", oblast: "Київська", condition: "NEW", image: "📷", views: 267, categoryId: categories[0].id, sellerId: seller1.id },
    { title: "Матеріал для пломбування Filtek Z550", description: "Нанокомпозит для прямої реставрації. 20 капсул по 0.2г.", price: 1850, city: "Харків", oblast: "Харківська", condition: "NEW", image: "🧪", views: 523, categoryId: categories[1].id, sellerId: seller2.id },
    { title: "Ендомотор Woodpecker U-Smart", description: "Бездротовий ендомотор з апекслокатором. 16 програм.", price: 18500, city: "Львів", oblast: "Львівська", condition: "NEW", image: "⚡", views: 198, categoryId: categories[2].id, sellerId: seller1.id },
    { title: "Коронки цирконієві заготовки 98мм", description: "Заготовки для фрезерування коронок. Діаметр 98мм. 5 штук.", price: 12000, city: "Київ", oblast: "Київська", condition: "NEW", image: "👑", views: 156, categoryId: categories[4].id, sellerId: seller3.id },
    { title: "Піскоструминний апарат Rondoflex", description: "Для препарування та очищення поверхонь зубів. Тиск 2-4 бар.", price: 24000, city: "Одеса", oblast: "Одеська", condition: "NEW", image: "💨", views: 89, categoryId: categories[0].id, sellerId: seller2.id },
    { title: "Хірургічний набір для імплантації", description: "Повний набір хірургічних інструментів. Сталь 316L.", price: 35000, city: "Дніпро", oblast: "Дніпропетровська", condition: "NEW", image: "🔪", views: 234, categoryId: categories[2].id, sellerId: seller1.id },
    { title: "Дезінфектор Durr FD 366", description: "Швидкодіючий дезінфектор для поверхонь. 5 літрів.", price: 680, city: "Вінниця", oblast: "Вінницька", condition: "NEW", image: "🧴", views: 445, categoryId: categories[7].id, sellerId: seller3.id },
    { title: "Капи ортодонтичні Invisalign", description: "Прозорі знімні капи для виправлення прикусу. Комплект на 6 місяців.", price: 45000, city: "Київ", oblast: "Київська", condition: "NEW", image: "😁", views: 312, categoryId: categories[5].id, sellerId: seller2.id },
  ];

  for (const product of productsData) {
    await prisma.product.create({ data: product });
  }

  console.log("✅ Товари створено");

  const clinicsData = [
    { name: "Стоматологія «Dent Lux»", description: "Клініка преміум класу з 15-річним досвідом. Повний спектр стоматологічних послуг.", city: "Київ", oblast: "Київська", address: "вул. Хрещатик, 22", phone: "+38 044 123-45-67", email: "info@dentlux.ua", image: "🏥", rating: 4.9, doctors: 8, founded: 2009 },
    { name: "Dental Art Lviv", description: "Сучасна клініка з художнім підходом до протезування та естетичної стоматології.", city: "Львів", oblast: "Львівська", address: "пр. Свободи, 18", phone: "+38 032 234-56-78", email: "hello@dentalart.ua", image: "🎨", rating: 4.8, doctors: 12, founded: 2014 },
    { name: "Клініка «Одеса Дент»", description: "Найбільша стоматологічна мережа в Одесі. 5 кабінетів, прийом без запису.", city: "Одеса", oblast: "Одеська", address: "вул. Дерибасівська, 5", phone: "+38 048 345-67-89", email: "admin@odessa-dent.ua", image: "🌊", rating: 4.7, doctors: 15, founded: 2007 },
    { name: "«Арт-Дент» Дніпро", description: "Спеціалізуємось на імплантації та ортодонтії. Власна зуботехнічна лабораторія.", city: "Дніпро", oblast: "Дніпропетровська", address: "пр. Яворницького, 91", phone: "+38 056 456-78-90", email: "artdent@dp.ua", image: "⚡", rating: 4.6, doctors: 6, founded: 2016 },
    { name: "«Харків Смайл»", description: "Центр сімейної стоматології. Дитячий кабінет, безболісне лікування.", city: "Харків", oblast: "Харківська", address: "вул. Сумська, 34", phone: "+38 057 567-89-01", email: "smile@kharkiv.ua", image: "😊", rating: 4.8, doctors: 10, founded: 2011 },
    { name: "Dent Premium Вінниця", description: "Клініка бізнес-класу. VIP кабінети, цирконієві коронки за 1 день.", city: "Вінниця", oblast: "Вінницька", address: "вул. Соборна, 75", phone: "+38 043 678-90-12", email: "premium@dent.vn.ua", image: "👑", rating: 4.9, doctors: 4, founded: 2019 },
    { name: "Стоматологія «Запоріжжя Дент»", description: "Доступна стоматологія для всієї родини. Гнучкий графік прийому.", city: "Запоріжжя", oblast: "Запорізька", address: "вул. Перемоги, 45", phone: "+38 061 789-01-23", email: "info@zp-dent.ua", image: "🦷", rating: 4.5, doctors: 7, founded: 2013 },
    { name: "Клініка «Полтава Смайл»", description: "Сучасна клініка з новітнім обладнанням. Лікування без болю та страху.", city: "Полтава", oblast: "Полтавська", address: "вул. Котляревського, 12", phone: "+38 053 890-12-34", email: "smile@poltava.ua", image: "✨", rating: 4.7, doctors: 5, founded: 2017 },
  ];

  const clinics = [];
  for (const clinic of clinicsData) {
    const created = await prisma.clinic.create({ data: clinic });
    clinics.push(created);
  }

  console.log("✅ Клініки створено");

  const servicesData = [
    { name: "Терапевтична стоматологія", description: "Лікування карієсу, пульпіту, реставрація зубів", priceFrom: 800, priceTo: 4500, duration: "30-90 хв" },
    { name: "Профілактика та гігієна", description: "Професійне чищення зубів, зняття зубного каменю", priceFrom: 600, priceTo: 1800, duration: "45-60 хв" },
    { name: "Хірургічна стоматологія", description: "Видалення зубів, складні операції", priceFrom: 1200, priceTo: 8000, duration: "30-120 хв" },
    { name: "Імплантація зубів", description: "Встановлення зубних імплантів, кісткова пластика", priceFrom: 18000, priceTo: 65000, duration: "60-180 хв" },
    { name: "Ортопедія та протезування", description: "Коронки, мости, знімні протези", priceFrom: 5000, priceTo: 45000, duration: "Кілька відвідувань" },
    { name: "Ортодонтія", description: "Брекети, капи, виправлення прикусу", priceFrom: 15000, priceTo: 85000, duration: "6-24 місяці" },
    { name: "Дитяча стоматологія", description: "Лікування молочних зубів, профілактика", priceFrom: 500, priceTo: 3000, duration: "20-60 хв" },
    { name: "Відбілювання зубів", description: "Zoom відбілювання, домашні системи", priceFrom: 4000, priceTo: 12000, duration: "60-90 хв" },
    { name: "Пародонтологія", description: "Лікування захворювань ясен, куретаж", priceFrom: 1500, priceTo: 12000, duration: "45-120 хв" },
    { name: "Ендодонтія", description: "Лікування кореневих каналів, депульпування", priceFrom: 2000, priceTo: 8000, duration: "60-120 хв" },
  ];

  const services = [];
  for (const service of servicesData) {
    const created = await prisma.service.create({ data: service });
    services.push(created);
  }

  console.log("✅ Послуги створено");

  const links = [
    { clinicId: clinics[0].id, serviceId: services[0].id },
    { clinicId: clinics[0].id, serviceId: services[1].id },
    { clinicId: clinics[0].id, serviceId: services[2].id },
    { clinicId: clinics[0].id, serviceId: services[3].id },
    { clinicId: clinics[0].id, serviceId: services[4].id },
    { clinicId: clinics[1].id, serviceId: services[1].id },
    { clinicId: clinics[1].id, serviceId: services[4].id },
    { clinicId: clinics[1].id, serviceId: services[5].id },
    { clinicId: clinics[2].id, serviceId: services[0].id },
    { clinicId: clinics[2].id, serviceId: services[1].id },
    { clinicId: clinics[2].id, serviceId: services[2].id },
    { clinicId: clinics[2].id, serviceId: services[6].id },
    { clinicId: clinics[3].id, serviceId: services[3].id },
    { clinicId: clinics[3].id, serviceId: services[4].id },
    { clinicId: clinics[3].id, serviceId: services[5].id },
    { clinicId: clinics[3].id, serviceId: services[9].id },
    { clinicId: clinics[4].id, serviceId: services[0].id },
    { clinicId: clinics[4].id, serviceId: services[1].id },
    { clinicId: clinics[4].id, serviceId: services[6].id },
    { clinicId: clinics[4].id, serviceId: services[7].id },
    { clinicId: clinics[5].id, serviceId: services[3].id },
    { clinicId: clinics[5].id, serviceId: services[4].id },
    { clinicId: clinics[5].id, serviceId: services[7].id },
    { clinicId: clinics[6].id, serviceId: services[0].id },
    { clinicId: clinics[6].id, serviceId: services[1].id },
    { clinicId: clinics[6].id, serviceId: services[6].id },
    { clinicId: clinics[7].id, serviceId: services[0].id },
    { clinicId: clinics[7].id, serviceId: services[8].id },
    { clinicId: clinics[7].id, serviceId: services[9].id },
  ];

  for (const link of links) {
    await prisma.clinicService.create({ data: link });
  }

  console.log("✅ Зв'язки клінік та послуг створено");
  console.log("🎉 База даних успішно заповнена!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });