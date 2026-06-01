#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

// @ts-expect-error Runtime module in current Node.
import { DatabaseSync } from "node:sqlite";

const root = process.cwd();
const dbDir = path.join(root, "data");
const dbPath = path.join(dbDir, "app.sqlite");
const migrationsDir = path.join(root, "supabase", "migrations");

fs.mkdirSync(dbDir, { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec("create table if not exists _migrations(name text primary key, applied_at text default (datetime('now')))");

const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
for (const file of files) {
  const exists = db.prepare("select 1 from _migrations where name=?").get(file);
  if (exists) continue;
  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
  db.exec("begin;");
  try {
    db.exec(sql);
    db.prepare("insert into _migrations(name) values (?)").run(file);
    db.exec("commit;");
    console.log(`Applied: ${file}`);
  } catch (error) {
    db.exec("rollback;");
    console.error(`Migration failed: ${file}`);
    throw error;
  }
}
console.log("Migrations done.");
