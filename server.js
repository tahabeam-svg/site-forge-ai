console.log("=== Application Starting ===");
console.log("Node version:", process.version);
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET (" + process.env.DATABASE_URL.substring(0, 30) + "...)" : "NOT SET");
console.log("SESSION_SECRET:", process.env.SESSION_SECRET ? "SET" : "NOT SET");
console.log("PORT:", process.env.PORT || "not set, will default to 5000");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("===========================");

try {
  require("./dist/index.cjs");
} catch (err) {
  console.error("FATAL ERROR loading application:", err.message);
  console.error(err.stack);
  process.exit(1);
}
