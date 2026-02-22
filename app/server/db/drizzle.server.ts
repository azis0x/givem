import { drizzle } from "drizzle-orm/neon-http";
import { neon, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema.server";

import ws from "ws";

neonConfig.webSocketConstructor = ws;

type DB = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  db: DB | undefined;
};

const db = drizzle({ client: neon(process.env.DATABASE_URL!), schema });

if (process.env.NODE_ENV !== "production") globalForDb.db = db;

export { db };
