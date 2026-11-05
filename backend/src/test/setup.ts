// Test environment setup
// Overrides env to use safe test defaults.
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || "mysql://root:NEWLAB01@localhost:3306/alohomora_db";
process.env.SESSION_SECRET = "test-session-secret-minimum-32-chars-long-alohomora";
process.env.GROQ_API_KEY = "";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.PORT = "5001";

