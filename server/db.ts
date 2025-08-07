import dotenv from "dotenv";
dotenv.config();

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({ connectionString: "postgresql://neondb_owner:npg_hFRMCX87ZeDG@ep-raspy-smoke-abtygxzs-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" });
export const db = drizzle({ client: pool, schema });

