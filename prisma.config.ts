import path from "path";
import { defineConfig } from "prisma/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const connectionString = `postgresql://postgres@localhost:5432/elavia_dent`;

const pool = new pg.Pool({ connectionString });

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: connectionString,
  },
  migrate: {
    adapter: new PrismaPg(pool),
  },
});