#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

function resolveTursoClientConfig() {
  const dataDir = path.join(process.cwd(), "data");
  const defaultDbPath = path.join(dataDir, "app.sqlite");
  const url = process.env.TURSO_DATABASE_URL ?? `file:${defaultDbPath}`;

  if (url.startsWith("file:")) {
    fs.mkdirSync(dataDir, { recursive: true });
    return { url, authToken: process.env.TURSO_AUTH_TOKEN };
  }

  if (!url.startsWith("libsql:")) {
    throw new Error("Unsupported TURSO_DATABASE_URL. Use file:... or libsql://...");
  }

  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_AUTH_TOKEN is required for remote libsql databases.");
  }

  return { url, authToken: process.env.TURSO_AUTH_TOKEN };
}

function splitSqlStatements(sql) {
  const stripped = sql.replace(/--[^\n]*/g, "");
  return stripped
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);
}

const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
const client = createClient(resolveTursoClientConfig());

await client.execute("pragma foreign_keys = on");
await client.execute(
  "create table if not exists _migrations (name text primary key, applied_at text not null default (datetime('now')))",
);

const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

for (const file of files) {
  const exists = await client.execute({
    sql: "select 1 from _migrations where name = ?",
    args: [file],
  });
  if (exists.rows.length > 0) continue;

  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
  const statements = splitSqlStatements(sql);
  const tx = await client.transaction("write");
  try {
    for (const statement of statements) {
      await tx.execute(statement);
    }
    await tx.execute({ sql: "insert into _migrations(name) values (?)", args: [file] });
    await tx.commit();
    console.log(`Applied: ${file}`);
  } catch (error) {
    await tx.rollback();
    console.error(`Migration failed: ${file}`);
    throw error;
  }
}

console.log("Migrations done.");
