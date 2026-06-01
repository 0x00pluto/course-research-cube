#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const migrationsDir = path.join(repoRoot, "supabase", "migrations");
const rawName = process.argv.slice(2).join("_").trim();

if (!rawName) {
  console.error("用法: npm run db:migration:new -- <migration_name>");
  process.exit(1);
}

const safeName = rawName.replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
const d = new Date();
const pad = (n) => String(n).padStart(2, "0");
const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
const filePath = path.join(migrationsDir, `${stamp}_${safeName}.sql`);

fs.mkdirSync(migrationsDir, { recursive: true });
fs.writeFileSync(filePath, `-- ${safeName}\n`, "utf8");
console.log(`已创建: ${path.relative(repoRoot, filePath)}`);
