import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";

const server = app.listen(env.port, "0.0.0.0", () => {
  console.log(`Mini Ticket Tracker API listening on port ${env.port}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received; shutting down gracefully.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
