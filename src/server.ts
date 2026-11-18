import { createApp } from "./app";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { env } from "./config/env";

async function main(): Promise<void> {
  await connectDatabase(env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const server = createApp().listen(env.PORT, env.HOST, () => {
    console.log(`API listening on http://${env.HOST}:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down`);
    server.close(() => {
      void disconnectDatabase().finally(() => process.exit(0));
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

main().catch((error: unknown) => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});
