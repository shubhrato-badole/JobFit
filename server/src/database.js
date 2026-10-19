import {Pool} from "pg"
import dotenv from "dotenv";
dotenv.config();


const db = new Pool({
connectionString: process.env.DATABASE_URL,
  // Managed databases need SSL; the local Docker Postgres does not (DATABASE_SSL=false).
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
 })

db.connect();


export default db;