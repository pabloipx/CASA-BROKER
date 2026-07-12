import { readFileSync } from "node:fs"
import { Client } from "pg"

const file = process.argv[2]
if (!file) {
  console.error("Usage: node _run-migration.mjs <sql-file>")
  process.exit(1)
}

const sql = readFileSync(file, "utf8")
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  await client.query(sql)
  console.log("[migration] OK:", file)
} catch (err) {
  console.error("[migration] ERROR:", err.message)
  process.exitCode = 1
} finally {
  await client.end()
}
