require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const dir = path.join(__dirname, "..", "migrations");
  const files = fs.readdirSync(dir).filter(f => f.endsWith(".sql")).sort();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    console.log(`Aplicando ${file}...`);
    await pool.query(sql);
  }
  console.log("Migração concluída.");
  await pool.end();
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
