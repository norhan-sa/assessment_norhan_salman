/**
 * Starts a throwaway MongoDB on the port from MONGODB_URI, for machines
 * without Docker or a local MongoDB install. Data is lost when it stops.
 */
import "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";

async function main(): Promise<void> {
  const uri = new URL(process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/task_management");
  const port = Number(uri.port || 27017);

  const mongo = await MongoMemoryServer.create({ instance: { port, ip: "127.0.0.1" } });
  console.log(`In-memory MongoDB running at ${mongo.getUri()} (Ctrl+C to stop)`);

  const stop = () => {
    void mongo.stop().finally(() => process.exit(0));
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

main().catch((error: unknown) => {
  console.error("Failed to start in-memory MongoDB:", error);
  process.exit(1);
});
