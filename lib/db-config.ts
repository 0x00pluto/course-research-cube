import fs from "node:fs";
import path from "node:path";

export function resolveTursoClientConfig() {
  const dataDir = path.join(process.cwd(), "data");
  const defaultDbPath = path.join(dataDir, "app.sqlite");
  const url = process.env.TURSO_DATABASE_URL ?? `file:${defaultDbPath}`;

  if (url.startsWith("file:")) {
    fs.mkdirSync(dataDir, { recursive: true });
    return {
      url,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }

  if (!url.startsWith("libsql:")) {
    throw new Error(
      `Unsupported TURSO_DATABASE_URL scheme. Use file:... for local or libsql://... for Turso Cloud.`,
    );
  }

  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error("TURSO_AUTH_TOKEN is required when TURSO_DATABASE_URL points to a remote libsql database.");
  }

  return {
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  };
}

export const migrationsDir = path.join(process.cwd(), "supabase", "migrations");
