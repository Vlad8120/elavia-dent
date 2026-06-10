-- Додаємо колонку для повнотекстового пошуку
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

-- Заповнюємо існуючі дані
UPDATE "Product" SET "search_vector" = 
  setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(city, '')), 'C');

-- Створюємо індекс для швидкого пошуку
CREATE INDEX IF NOT EXISTS product_search_idx ON "Product" USING GIN(search_vector);

-- Тригер для автоматичного оновлення при зміні товару
CREATE OR REPLACE FUNCTION update_product_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.city, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_search_trigger ON "Product";
CREATE TRIGGER product_search_trigger
  BEFORE INSERT OR UPDATE ON "Product"
  FOR EACH ROW EXECUTE FUNCTION update_product_search_vector();

-- Те саме для клінік
ALTER TABLE "Clinic" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

UPDATE "Clinic" SET "search_vector" = 
  setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('simple', coalesce(city, '')), 'C');

CREATE INDEX IF NOT EXISTS clinic_search_idx ON "Clinic" USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_clinic_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.city, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clinic_search_trigger ON "Clinic";
CREATE TRIGGER clinic_search_trigger
  BEFORE INSERT OR UPDATE ON "Clinic"
  FOR EACH ROW EXECUTE FUNCTION update_clinic_search_vector();

-- Послуги
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "search_vector" tsvector;

UPDATE "Service" SET "search_vector" = 
  setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('simple', coalesce(description, '')), 'B');

CREATE INDEX IF NOT EXISTS service_search_idx ON "Service" USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_service_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector = 
    setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS service_search_trigger ON "Service";
CREATE TRIGGER service_search_trigger
  BEFORE INSERT OR UPDATE ON "Service"
  FOR EACH ROW EXECUTE FUNCTION update_service_search_vector();