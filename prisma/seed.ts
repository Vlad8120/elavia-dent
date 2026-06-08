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

  const seller1 = await prisma.user.upsert({ where: { email: "medtech@elavia-dent.ua" }, update: {}, create: { name: "МедТех Постач", email: "medtech@elavia-dent.ua", password: hashedPassword, role: "SELLER", city: "Київ" } });
  const seller2 = await prisma.user.upsert({ where: { email: "dentexpert@elavia-dent.ua" }, update: {}, create: { name: "ДентаЕксперт", email: "dentexpert@elavia-dent.ua", password: hashedPassword, role: "SELLER", city: "Львів" } });
  const seller3 = await prisma.user.upsert({ where: { email: "stomaservis@elavia-dent.ua" }, update: {}, create: { name: "Стома Сервіс", email: "stomaservis@elavia-dent.ua", password: hashedPassword, role: "SELLER", city: "Одеса" } });
  const seller4 = await prisma.user.upsert({ where: { email: "dentapro@elavia-dent.ua" }, update: {}, create: { name: "ДентаПро", email: "dentapro@elavia-dent.ua", password: hashedPassword, role: "SELLER", city: "Харків" } });
  const seller5 = await prisma.user.upsert({ where: { email: "medplus@elavia-dent.ua" }, update: {}, create: { name: "МедПлюс", email: "medplus@elavia-dent.ua", password: hashedPassword, role: "SELLER", city: "Дніпро" } });
  await prisma.user.upsert({ where: { email: "admin@elavia-dent.ua" }, update: {}, create: { name: "Кнюх Владислав", email: "admin@elavia-dent.ua", password: hashedPassword, role: "ADMIN", city: "Київ" } });
  console.log("✅ Користувачі створено");

  const sellers = [seller1, seller2, seller3, seller4, seller5];
  const cities = [
    { city: "Київ", oblast: "Київська" },
    { city: "Львів", oblast: "Львівська" },
    { city: "Одеса", oblast: "Одеська" },
    { city: "Дніпро", oblast: "Дніпропетровська" },
    { city: "Харків", oblast: "Харківська" },
    { city: "Вінниця", oblast: "Вінницька" },
    { city: "Запоріжжя", oblast: "Запорізька" },
    { city: "Полтава", oblast: "Полтавська" },
    { city: "Черкаси", oblast: "Черкаська" },
    { city: "Житомир", oblast: "Житомирська" },
  ];

  const productsData = [
    // Стоматологічне обладнання (7)
    { title: "Стоматологічна установка KAVO Estetica E70", description: "Сучасна установка преміум класу. Турбінний наконечник, мікромотор, скалер. Гарантія 2 роки.", price: 285000, condition: "NEW", image: "🦷", views: 342, categoryId: categories[0].id },
    { title: "Рентген-апарат Planmeca ProMax 3D", description: "Цифровий панорамний рентген з функцією 3D томографії. Мінімальна доза опромінення.", price: 420000, condition: "NEW", image: "📡", views: 218, categoryId: categories[0].id },
    { title: "Фотополімерна лампа Woodpecker LED.F", description: "Бездротова LED лампа для полімеризації. Потужність 1500 мВт/см².", price: 8500, condition: "NEW", image: "💡", views: 431, categoryId: categories[0].id },
    { title: "Стоматологічне крісло A-Dec 300", description: "Крісло в відмінному стані 2022 рік. Гідравліка + електрика.", price: 145000, condition: "USED", image: "🪑", views: 312, categoryId: categories[0].id },
    { title: "Цифровий інтраоральний сканер 3Shape", description: "Професійний сканер для цифрового відбитку. Точність 5 мкм.", price: 380000, condition: "NEW", image: "📷", views: 267, categoryId: categories[0].id },
    { title: "Піскоструминний апарат Rondoflex Plus", description: "Для препарування та очищення поверхонь зубів. Тиск 2-4 бар.", price: 24000, condition: "NEW", image: "💨", views: 89, categoryId: categories[0].id },
    { title: "Компресор стоматологічний безмасляний Jun-Air", description: "Безмасляний компресор для стоматологічних установок. Тихий, продуктивний.", price: 32000, condition: "NEW", image: "⚙️", views: 145, categoryId: categories[0].id },
    // Витратні матеріали (6)
    { title: "Компомер Dyract XP 20 шт", description: "Компомер для реставрації зубів. 20 картриджів по 0.25г.", price: 3200, condition: "NEW", image: "💊", views: 289, categoryId: categories[1].id },
    { title: "Артикуляційна папір Bausch 200мкм", description: "Для визначення оклюзійних контактів. 300 листів.", price: 380, condition: "NEW", image: "📄", views: 712, categoryId: categories[1].id },
    { title: "Матеріал для пломбування Filtek Z550", description: "Нанокомпозит для прямої реставрації. 20 капсул по 0.2г.", price: 1850, condition: "NEW", image: "🧪", views: 523, categoryId: categories[1].id },
    { title: "Відбитковий матеріал Impregum Penta Soft", description: "Поліефірний відбитковий матеріал. Картридж 380мл.", price: 4200, condition: "NEW", image: "🪣", views: 178, categoryId: categories[1].id },
    { title: "Цемент склоіономерний Ketac Molar", description: "Для постійного пломбування молярів. 50г порошок + рідина.", price: 1650, condition: "NEW", image: "🧱", views: 234, categoryId: categories[1].id },
    { title: "Адгезивна система OptiBond FL", description: "Тотальне протравлювання. Флакон 5мл праймер + бонд.", price: 2800, condition: "NEW", image: "💧", views: 189, categoryId: categories[1].id },
    // Інструменти (6)
    { title: "Набір ендодонтичних файлів ProTaper Next", description: "Ротаційні нікель-титанові файли. Розміри X1-X5. 6 упаковок.", price: 4800, condition: "NEW", image: "🔧", views: 567, categoryId: categories[2].id },
    { title: "Турбінний наконечник NSK PanaMax2", description: "Високошвидкісний наконечник з підсвічуванням. 5 точок підведення води.", price: 12800, condition: "NEW", image: "🔬", views: 445, categoryId: categories[2].id },
    { title: "Ендомотор Woodpecker U-Smart", description: "Бездротовий ендомотор з апекслокатором. 16 програм.", price: 18500, condition: "NEW", image: "⚡", views: 198, categoryId: categories[2].id },
    { title: "Хірургічний набір для імплантації", description: "Повний набір хірургічних інструментів. Сталь 316L.", price: 35000, condition: "NEW", image: "🔪", views: 234, categoryId: categories[2].id },
    { title: "Скалер ультразвуковий EMS Piezon 250", description: "Ультразвуковий скалер для видалення зубного каменю.", price: 15000, condition: "NEW", image: "📻", views: 167, categoryId: categories[2].id },
    { title: "Мікромотор NSK Ti-Max Z45L", description: "Кутовий наконечник з підсвічуванням 1:5. Швидкість до 200000 об/хв.", price: 9800, condition: "NEW", image: "🌀", views: 203, categoryId: categories[2].id },
    // Імплантати (6)
    { title: "Імплантати Nobel Biocare Active 5 шт", description: "Титанові зубні імплантати з покриттям TiUnite. Розміри 4.3×10мм.", price: 52000, condition: "NEW", image: "⚙️", views: 198, categoryId: categories[3].id },
    { title: "Імплантати Straumann BLX 4.0×10мм", description: "Широке первинне стабілізаційне з'єднання. Самонарізна різьба.", price: 48000, condition: "NEW", image: "🔩", views: 156, categoryId: categories[3].id },
    { title: "Імплантати MIS Seven 3.75×11.5мм", description: "Ізраїльські імплантати. Відмінна остеоінтеграція.", price: 18000, condition: "NEW", image: "🦾", views: 234, categoryId: categories[3].id },
    { title: "Абатменти титанові Universal 5шт", description: "Прямі титанові абатменти. Сумісні з Nobel, Straumann, MIS.", price: 12000, condition: "NEW", image: "🔌", views: 145, categoryId: categories[3].id },
    { title: "Кісткова стружка Bio-Oss 0.5г", description: "Для кісткової пластики. Гранули 0.25-1мм.", price: 8500, condition: "NEW", image: "🦴", views: 189, categoryId: categories[3].id },
    { title: "Мембрана колагенова Bio-Gide 25×25мм", description: "Резорбована колагенова мембрана для спрямованої регенерації.", price: 6800, condition: "NEW", image: "📋", views: 123, categoryId: categories[3].id },
    // Протезування (6)
    { title: "Коронки цирконієві заготовки 98мм", description: "Заготовки для фрезерування коронок. Діаметр 98мм. 5 штук.", price: 12000, condition: "NEW", image: "👑", views: 156, categoryId: categories[4].id },
    { title: "Артикулятор Whip-Mix 2240", description: "Стоматологічний артикулятор середньоанатомічного типу.", price: 8500, condition: "NEW", image: "⚖️", views: 134, categoryId: categories[4].id },
    { title: "Воскові заготовки Renfert для моделювання", description: "Набір восків для моделювання коронок і мостів. 500г.", price: 1200, condition: "NEW", image: "🕯️", views: 267, categoryId: categories[4].id },
    { title: "Акрил для базисів Vertex Orthoplast", description: "Акриловий базисний матеріал. Порошок + рідина.", price: 2400, condition: "NEW", image: "🧴", views: 198, categoryId: categories[4].id },
    { title: "Фрезерний станок Roland DWX-52D", description: "5-осьовий стоматологічний фрезерний станок для CAD/CAM.", price: 650000, condition: "USED", image: "🖥️", views: 89, categoryId: categories[4].id },
    { title: "Сканер зуботехнічний 3Shape E3", description: "Лабораторний сканер для цифрового моделювання протезів.", price: 185000, condition: "NEW", image: "📱", views: 112, categoryId: categories[4].id },
    // Ортодонтія (6)
    { title: "Ортодонтичні брекети 3M Clarity", description: "Керамічні самолігуючі брекети. Комплект на 10 пацієнтів.", price: 28000, condition: "NEW", image: "📐", views: 134, categoryId: categories[5].id },
    { title: "Капи ортодонтичні Invisalign", description: "Прозорі знімні капи для виправлення прикусу. 6 місяців.", price: 45000, condition: "NEW", image: "😁", views: 312, categoryId: categories[5].id },
    { title: "Дуги ортодонтичні NiTi 0.014 100шт", description: "Нікель-титанові ортодонтичні дуги. Термоактивні.", price: 1800, condition: "NEW", image: "🌉", views: 245, categoryId: categories[5].id },
    { title: "Кільця ортодонтичні сталеві 50шт", description: "Молярні кільця з трубками для 1-го моляра.", price: 3200, condition: "NEW", image: "⭕", views: 178, categoryId: categories[5].id },
    { title: "Ретейнер знімний індивідуальний", description: "Після зняття брекетів. Термопластичний матеріал.", price: 4500, condition: "NEW", image: "🦷", views: 289, categoryId: categories[5].id },
    { title: "Лицьова дуга Bock з головним убором", description: "Для позаротового тяги. Розмір S/M/L.", price: 2800, condition: "NEW", image: "🎭", views: 134, categoryId: categories[5].id },
    // Анестезія (7)
    { title: "Анестетик Ubistesini 4% 50 карпул", description: "Карпульний анестетик з артикаїном 4%. Термін до 2027.", price: 2100, condition: "NEW", image: "💉", views: 890, categoryId: categories[6].id },
    { title: "Анестетик Ultracain DS Forte 100 карпул", description: "Артикаїн 4% з адреналіном 1:100000.", price: 3800, condition: "NEW", image: "💊", views: 756, categoryId: categories[6].id },
    { title: "Карпульний шприц Асепт металевий", description: "Аспіраційний карпульний шприц. Сталь.", price: 850, condition: "NEW", image: "🩺", views: 445, categoryId: categories[6].id },
    { title: "Голки карпульні Septodont 27G 100шт", description: "Стерильні голки для карпульного шприца. Короткі 25мм.", price: 420, condition: "NEW", image: "📌", views: 634, categoryId: categories[6].id },
    { title: "Гель аплікаційний Kamistad 20г", description: "Аплікаційний анестетик для поверхневого знеболення. Лідокаїн 2%.", price: 380, condition: "NEW", image: "🧊", views: 523, categoryId: categories[6].id },
    { title: "Анестетик Scandonest 3% 50 карпул", description: "Мепівакаїн 3% без вазоконстриктора. Для гіпертоніків.", price: 2600, condition: "NEW", image: "💉", views: 345, categoryId: categories[6].id },
    { title: "Підігрівач анестетику SyJet", description: "Підігрів карпул до температури тіла. Зменшує дискомфорт.", price: 4200, condition: "NEW", image: "🌡️", views: 234, categoryId: categories[6].id },
    // Дезінфекція (6)
    { title: "Автоклав Melag Vacuklav 31B+", description: "Вакуумний паровий автоклав клас B. Обʼєм камери 17л.", price: 96000, condition: "NEW", image: "⚗️", views: 156, categoryId: categories[7].id },
    { title: "Дезінфектор Durr FD 366", description: "Швидкодіючий дезінфектор для поверхонь. 5 літрів.", price: 680, condition: "NEW", image: "🧴", views: 445, categoryId: categories[7].id },
    { title: "Ультразвукова мийка Sonica 2200", description: "Для передстерилізаційного очищення інструментів. 2.2л.", price: 12000, condition: "NEW", image: "🔊", views: 267, categoryId: categories[7].id },
    { title: "Мішечки для стерилізації 100×200мм 200шт", description: "Самозапечатувані пакети для автоклавування.", price: 320, condition: "NEW", image: "📦", views: 589, categoryId: categories[7].id },
    { title: "Дезінфікуючий засіб Lysoformin 3000", description: "Концентрат для дезінфекції поверхонь та інструментів. 2л.", price: 1200, condition: "NEW", image: "🧪", views: 378, categoryId: categories[7].id },
    { title: "УФ-камера для зберігання інструментів", description: "Камера з УФ-опроміненням для стерильного зберігання.", price: 4500, condition: "NEW", image: "💡", views: 234, categoryId: categories[7].id },
  ];

  for (let i = 0; i < productsData.length; i++) {
    const p = productsData[i];
    const loc = cities[i % cities.length];
    const seller = sellers[i % sellers.length];
    await prisma.product.create({
      data: {
        ...p,
        city: loc.city,
        oblast: loc.oblast,
        sellerId: seller.id,
      }
    });
  }
  console.log(`✅ Товари створено (${productsData.length})`);

  const clinicsData = [
    { name: "Стоматологія «Dent Lux»", description: "Клініка преміум класу з 15-річним досвідом. Повний спектр послуг.", city: "Київ", oblast: "Київська", address: "вул. Хрещатик, 22", phone: "+38 044 123-45-67", email: "info@dentlux.ua", image: "🏥", rating: 4.9, doctors: 8, founded: 2009 },
    { name: "Dental Art Kyiv", description: "Сучасна клініка в центрі Києва. Імплантація та естетика.", city: "Київ", oblast: "Київська", address: "вул. Богдана Хмельницького, 15", phone: "+38 044 234-56-78", email: "art@dental.ua", image: "🎨", rating: 4.8, doctors: 6, founded: 2015 },
    { name: "SmilePro Київ", description: "Сімейна стоматологія. Прийом дітей від 3 років.", city: "Київ", oblast: "Київська", address: "просп. Перемоги, 47", phone: "+38 044 345-67-89", email: "smile@pro.ua", image: "😊", rating: 4.7, doctors: 10, founded: 2012 },
    { name: "Dental Art Lviv", description: "Художній підхід до протезування та естетичної стоматології.", city: "Львів", oblast: "Львівська", address: "пр. Свободи, 18", phone: "+38 032 234-56-78", email: "hello@dentalart.ua", image: "🎭", rating: 4.8, doctors: 12, founded: 2014 },
    { name: "Lviv Dent Center", description: "Центр імплантації та ортодонтії у Львові.", city: "Львів", oblast: "Львівська", address: "вул. Городоцька, 34", phone: "+38 032 345-67-89", email: "center@lvivdent.ua", image: "⭐", rating: 4.7, doctors: 8, founded: 2016 },
    { name: "ГалДент Львів", description: "Доступна стоматологія для всієї родини.", city: "Львів", oblast: "Львівська", address: "вул. Личаківська, 56", phone: "+38 032 456-78-90", email: "galdent@ua.ua", image: "🦷", rating: 4.5, doctors: 5, founded: 2010 },
    { name: "Клініка «Одеса Дент»", description: "Найбільша стоматологічна мережа в Одесі.", city: "Одеса", oblast: "Одеська", address: "вул. Дерибасівська, 5", phone: "+38 048 345-67-89", email: "admin@odessa-dent.ua", image: "🌊", rating: 4.7, doctors: 15, founded: 2007 },
    { name: "Black Sea Dental", description: "Сучасна клініка біля моря. VIP-кабінети.", city: "Одеса", oblast: "Одеська", address: "вул. Французький бульвар, 12", phone: "+38 048 456-78-90", email: "sea@dental.ua", image: "🏖️", rating: 4.6, doctors: 7, founded: 2018 },
    { name: "Одеса Смайл", description: "Відбілювання та косметична стоматологія.", city: "Одеса", oblast: "Одеська", address: "вул. Пушкінська, 23", phone: "+38 048 567-89-01", email: "smile@odessa.ua", image: "✨", rating: 4.8, doctors: 4, founded: 2019 },
    { name: "«Арт-Дент» Дніпро", description: "Імплантація та ортодонтія. Власна зуботехнічна лабораторія.", city: "Дніпро", oblast: "Дніпропетровська", address: "пр. Яворницького, 91", phone: "+38 056 456-78-90", email: "artdent@dp.ua", image: "⚡", rating: 4.6, doctors: 6, founded: 2016 },
    { name: "Дніпро Дент Плюс", description: "Комплексна стоматологія в Дніпрі.", city: "Дніпро", oblast: "Дніпропетровська", address: "вул. Робоча, 77", phone: "+38 056 567-89-01", email: "plus@dniprodent.ua", image: "💎", rating: 4.5, doctors: 9, founded: 2013 },
    { name: "Impladent Дніпро", description: "Спеціалізація — дентальна імплантація.", city: "Дніпро", oblast: "Дніпропетровська", address: "просп. Гагаріна, 45", phone: "+38 056 678-90-12", email: "impla@dent.dp.ua", image: "🔩", rating: 4.7, doctors: 4, founded: 2017 },
    { name: "«Харків Смайл»", description: "Центр сімейної стоматології. Дитячий кабінет.", city: "Харків", oblast: "Харківська", address: "вул. Сумська, 34", phone: "+38 057 567-89-01", email: "smile@kharkiv.ua", image: "😊", rating: 4.8, doctors: 10, founded: 2011 },
    { name: "Харків Дент Еліт", description: "Елітна стоматологія в Харкові.", city: "Харків", oblast: "Харківська", address: "просп. Науки, 14", phone: "+38 057 678-90-12", email: "elite@kharkiv.ua", image: "👑", rating: 4.9, doctors: 6, founded: 2015 },
    { name: "Клініка Здорової Посмішки", description: "Терапія та профілактика. Безболісне лікування.", city: "Харків", oblast: "Харківська", address: "вул. Клочківська, 89", phone: "+38 057 789-01-23", email: "health@smile.kh.ua", image: "💚", rating: 4.6, doctors: 8, founded: 2010 },
    { name: "Dent Premium Вінниця", description: "VIP кабінети, цирконієві коронки за 1 день.", city: "Вінниця", oblast: "Вінницька", address: "вул. Соборна, 75", phone: "+38 043 678-90-12", email: "premium@dent.vn.ua", image: "👑", rating: 4.9, doctors: 4, founded: 2019 },
    { name: "ВінДент Плюс", description: "Комплексне лікування з гарантією якості.", city: "Вінниця", oblast: "Вінницька", address: "вул. Пирогова, 102", phone: "+38 043 789-01-23", email: "plus@vindent.ua", image: "🌟", rating: 4.7, doctors: 7, founded: 2014 },
    { name: "Сімейна стоматологія Вінниця", description: "Доступні ціни та висока якість лікування.", city: "Вінниця", oblast: "Вінницька", address: "вул. Келецька, 55", phone: "+38 043 890-12-34", email: "family@dent.vn.ua", image: "👨‍👩‍👧", rating: 4.5, doctors: 6, founded: 2011 },
    { name: "Стоматологія «Запоріжжя Дент»", description: "Доступна стоматологія для всієї родини.", city: "Запоріжжя", oblast: "Запорізька", address: "вул. Перемоги, 45", phone: "+38 061 789-01-23", email: "info@zp-dent.ua", image: "🦷", rating: 4.5, doctors: 7, founded: 2013 },
    { name: "Запоріжжя Імплант Центр", description: "Спеціалізований центр імплантації.", city: "Запоріжжя", oblast: "Запорізька", address: "просп. Соборний, 134", phone: "+38 061 890-12-34", email: "implant@zp.ua", image: "⚙️", rating: 4.7, doctors: 5, founded: 2016 },
    { name: "Клініка «Полтава Смайл»", description: "Лікування без болю та страху.", city: "Полтава", oblast: "Полтавська", address: "вул. Котляревського, 12", phone: "+38 053 890-12-34", email: "smile@poltava.ua", image: "✨", rating: 4.7, doctors: 5, founded: 2017 },
    { name: "Полтава Дент Класик", description: "Класична стоматологія з сучасним підходом.", city: "Полтава", oblast: "Полтавська", address: "вул. Пушкіна, 28", phone: "+38 053 901-23-45", email: "classic@poltava.ua", image: "🏛️", rating: 4.6, doctors: 4, founded: 2012 },
    { name: "Черкаси Дент", description: "Сучасна клініка в центрі Черкас.", city: "Черкаси", oblast: "Черкаська", address: "бул. Шевченка, 67", phone: "+38 047 234-56-78", email: "info@cherkasydent.ua", image: "🌻", rating: 4.6, doctors: 6, founded: 2015 },
    { name: "Стоматологія Черкащина", description: "Повний спектр стоматологічних послуг.", city: "Черкаси", oblast: "Черкаська", address: "вул. Смілянська, 45", phone: "+38 047 345-67-89", email: "cherkashyna@dent.ua", image: "💙", rating: 4.5, doctors: 8, founded: 2009 },
    { name: "Житомир Дент Центр", description: "Сучасне обладнання, досвідчені лікарі.", city: "Житомир", oblast: "Житомирська", address: "вул. Михайлівська, 34", phone: "+38 041 234-56-78", email: "center@zhytomyr.ua", image: "🌿", rating: 4.7, doctors: 5, founded: 2014 },
    { name: "Білоцерківська Стоматологія", description: "Доступне та якісне лікування зубів.", city: "Біла Церква", oblast: "Київська", address: "вул. Ярослава Мудрого, 23", phone: "+38 045 234-56-78", email: "bila@dent.ua", image: "🏥", rating: 4.5, doctors: 4, founded: 2013 },
    { name: "Кременчук Дент", description: "Сімейна стоматологія в Кременчуці.", city: "Кременчук", oblast: "Полтавська", address: "вул. Перемоги, 56", phone: "+38 053 456-78-90", email: "kremenchuk@dent.ua", image: "⭐", rating: 4.4, doctors: 5, founded: 2011 },
    { name: "Миколаїв Смайл", description: "Естетична стоматологія та ортодонтія.", city: "Миколаїв", oblast: "Миколаївська", address: "просп. Центральний, 78", phone: "+38 051 234-56-78", email: "smile@mykolaiv.ua", image: "😁", rating: 4.6, doctors: 6, founded: 2016 },
    { name: "Херсон Дент", description: "Комплексна стоматологія для всієї родини.", city: "Херсон", oblast: "Херсонська", address: "вул. Суворова, 12", phone: "+38 055 234-56-78", email: "herson@dent.ua", image: "🌊", rating: 4.5, doctors: 4, founded: 2012 },
    { name: "Ужгород Дент Центр", description: "Сучасна клініка на Закарпатті.", city: "Ужгород", oblast: "Закарпатська", address: "пл. Корятовича, 3", phone: "+38 031 234-56-78", email: "uzhhorod@dent.ua", image: "🏔️", rating: 4.7, doctors: 5, founded: 2015 },
  ];

  const clinics = [];
  for (const clinic of clinicsData) {
    const created = await prisma.clinic.create({ data: clinic });
    clinics.push(created);
  }
  console.log(`✅ Клініки створено (${clinicsData.length})`);

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
    { name: "Естетична реставрація", description: "Відновлення форми та кольору зубів композитом", priceFrom: 1500, priceTo: 6000, duration: "60-120 хв" },
    { name: "Вінірування зубів", description: "Керамічні та композитні вініри", priceFrom: 8000, priceTo: 25000, duration: "2-3 відвідування" },
    { name: "Панорамний рентген", description: "Цифрова ортопантомограма", priceFrom: 350, priceTo: 800, duration: "15 хв" },
    { name: "3D томографія", description: "Конусно-променева КТ щелепи", priceFrom: 800, priceTo: 1800, duration: "20 хв" },
    { name: "Лікування пародонтиту", description: "Комплексне лікування захворювань пародонту", priceFrom: 2500, priceTo: 15000, duration: "Кілька відвідувань" },
    { name: "Air Flow чищення", description: "Пескоструминне очищення зубів", priceFrom: 800, priceTo: 1500, duration: "30-45 хв" },
    { name: "Фторування зубів", description: "Насичення емалі фтором для профілактики", priceFrom: 400, priceTo: 900, duration: "30 хв" },
    { name: "Герметизація фісур", description: "Профілактика карієсу у дітей", priceFrom: 300, priceTo: 700, duration: "20-30 хв" },
    { name: "Видалення зуба мудрості", description: "Складне видалення ретинованих зубів", priceFrom: 2500, priceTo: 8000, duration: "30-120 хв" },
    { name: "Синус-ліфтинг", description: "Нарощування кісткової тканини верхньої щелепи", priceFrom: 15000, priceTo: 45000, duration: "90-180 хв" },
    { name: "Корекція ясен", description: "Гінгівопластика, усунення ясенних кишень", priceFrom: 3000, priceTo: 15000, duration: "60-120 хв" },
    { name: "Шинування зубів", description: "Укріплення рухливих зубів при пародонтиті", priceFrom: 4000, priceTo: 12000, duration: "60-90 хв" },
    { name: "Лікування стоматиту", description: "Медикаментозне лікування афтозного стоматиту", priceFrom: 500, priceTo: 2000, duration: "20-30 хв" },
    { name: "Місцева анестезія", description: "Карпульна анестезія артикаїном", priceFrom: 150, priceTo: 400, duration: "5-10 хв" },
    { name: "Седація (Закис азоту)", description: "Знеболення закисом азоту для тривожних пацієнтів", priceFrom: 800, priceTo: 1500, duration: "Весь прийом" },
    { name: "Загальний наркоз", description: "Лікування під загальним знеболенням", priceFrom: 5000, priceTo: 15000, duration: "Весь прийом" },
    { name: "Металокерамічна коронка", description: "Коронка на металевому каркасі з керамікою", priceFrom: 3500, priceTo: 6000, duration: "2-3 відвідування" },
    { name: "Цирконієва коронка", description: "Безметалева коронка з диоксиду цирконію", priceFrom: 7000, priceTo: 15000, duration: "2-3 відвідування" },
    { name: "Керамічна коронка E.max", description: "Естетична пресована кераміка", priceFrom: 9000, priceTo: 18000, duration: "2-3 відвідування" },
    { name: "Знімний протез акриловий", description: "Повний або частковий знімний протез", priceFrom: 8000, priceTo: 18000, duration: "Кілька відвідувань" },
    { name: "Бюгельний протез", description: "Частковий знімний протез на металевому каркасі", priceFrom: 12000, priceTo: 25000, duration: "Кілька відвідувань" },
    { name: "Зубний міст", description: "Незнімний мостоподібний протез на 3-4 зуби", priceFrom: 9000, priceTo: 22000, duration: "Кілька відвідувань" },
    { name: "Лікування флюсу", description: "Видалення гнійника, антибіотикотерапія", priceFrom: 1200, priceTo: 3500, duration: "30-60 хв" },
    { name: "Пломба фотополімерна", description: "Естетична реставрація нанокомпозитом", priceFrom: 800, priceTo: 2500, duration: "30-60 хв" },
    { name: "Пломба склоіономерна", description: "Хімічно-затверджувана пломба для молярів", priceFrom: 500, priceTo: 1200, duration: "20-40 хв" },
    { name: "Ретенційна шина", description: "Знімний ретейнер після ортодонтичного лікування", priceFrom: 2500, priceTo: 5000, duration: "30 хв" },
    { name: "Міжщелепна тяга", description: "Еластики для корекції прикусу при брекетах", priceFrom: 200, priceTo: 500, duration: "10 хв" },
    { name: "Консультація ортодонта", description: "Первинна консультація та план лікування", priceFrom: 300, priceTo: 800, duration: "30-60 хв" },
    { name: "Консультація імплантолога", description: "Огляд та планування імплантації", priceFrom: 300, priceTo: 800, duration: "30-60 хв" },
    { name: "Консультація хірурга", description: "Хірургічна консультація та рентген", priceFrom: 200, priceTo: 600, duration: "20-30 хв" },
    { name: "Профілактичний огляд", description: "Плановий огляд порожнини рота", priceFrom: 150, priceTo: 400, duration: "15-20 хв" },
    { name: "Лікування гіперестезії", description: "Зниження чутливості зубів", priceFrom: 600, priceTo: 1800, duration: "30-45 хв" },
    { name: "Внутрішньоканальне відбілювання", description: "Відбілювання депульпованого зуба зсередини", priceFrom: 1500, priceTo: 4000, duration: "Кілька відвідувань" },
    { name: "Апікоектомія", description: "Резекція верхівки кореня зуба", priceFrom: 3500, priceTo: 8000, duration: "60-90 хв" },
    { name: "Реімплантація зуба", description: "Повторне встановлення вибитого зуба", priceFrom: 2000, priceTo: 5000, duration: "30-60 хв" },
    { name: "PRP терапія", description: "Збагачена тромбоцитами плазма для загоєння", priceFrom: 2000, priceTo: 5000, duration: "30-60 хв" },
    { name: "Лазерна стоматологія", description: "Лікування лазером. Безболісно та без крові.", priceFrom: 1500, priceTo: 8000, duration: "20-90 хв" },
    { name: "Мікроскопна стоматологія", description: "Лікування під дентальним мікроскопом", priceFrom: 3000, priceTo: 12000, duration: "60-180 хв" },
    { name: "Цифровий відбиток", description: "Сканування зубів без відбиткових мас", priceFrom: 800, priceTo: 2000, duration: "20-30 хв" },
    { name: "CAD/CAM коронка за 1 день", description: "Цирконієва коронка за одне відвідування", priceFrom: 8000, priceTo: 18000, duration: "3-4 год" },
  ];

  const services = [];
  for (const service of servicesData) {
    const created = await prisma.service.create({ data: service });
    services.push(created);
  }
  console.log(`✅ Послуги створено (${servicesData.length})`);

  // Зв'язки клінік та послуг
  for (let i = 0; i < clinics.length; i++) {
    const clinic = clinics[i];
    const numServices = 5 + Math.floor(Math.random() * 8);
    const shuffled = [...services].sort(() => Math.random() - 0.5);
    for (let j = 0; j < numServices && j < shuffled.length; j++) {
      await prisma.clinicService.create({
        data: { clinicId: clinic.id, serviceId: shuffled[j].id }
      });
    }
  }
  console.log("✅ Зв'язки клінік та послуг створено");
  console.log("🎉 База даних успішно заповнена!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });