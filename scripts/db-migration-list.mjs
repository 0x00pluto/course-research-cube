#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const migrationsDir = path.join(repoRoot, "supabase", "migrations");

if (!fs.existsSync(migrationsDir)) {
  console.log("未发现 migrations 目录");
  process.exit(0);
}

const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
console.log("Local migrations:");
for (const file of files) {
  console.log(`- ${file}`);
}
