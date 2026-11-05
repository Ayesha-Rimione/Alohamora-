import app from "./app";
import { env } from "./config/env";
import { prisma, checkDatabaseConnection } from "./config/prisma";

async function main() {
  console.log(`\n🔑 Alohomora! Backend starting (${env.NODE_ENV})...`);

  // Verify database is reachable before accepting connections
  const dbOk = await checkDatabaseConnection();
  if (!dbOk) {
    console.error(
      "❌ Cannot connect to MySQL database. Check DATABASE_URL in your .env file.",
    );
    process.exit(1);
  }
  console.log("✅ Database connection established.");

  const server = app.listen(env.PORT, () => {
    console.log(`✅ Server running at http://localhost:${env.PORT}`);
    console.log(`   API prefix: ${env.API_PREFIX}`);
    console.log(`   Frontend origin: ${env.CLIENT_ORIGIN}`);
    if (!env.GROQ_API_KEY || env.GROQ_API_KEY.includes("your_groq_api_key")) {
      console.warn(
        "⚠️  GROQ_API_KEY not configured — Professor Who? will return a dev fallback message.",
      );
    }
    console.log(`\n🗺️  Marauder Map active. The Keykeeper Owl is watching. ✦\n`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    await prisma.$disconnect();
    server.close(() => {
      console.log("Server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

