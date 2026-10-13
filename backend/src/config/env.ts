import dotenv from "dotenv";

// Local development keeps one .env file at the monorepo root. In hosted environments,
// environment variables are injected by the platform and the missing file is harmless.
dotenv.config({ path: "../.env" });

function numberFromEnv(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error("PORT must be a valid port number.");
  }
  return parsed;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: numberFromEnv(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};
