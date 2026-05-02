import {Pool} from "pg"
import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === 'production'

const db = new Pool({
user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  ssl: isProduction ? { rejectUnauthorized: false } : false
 })

db.connect();
console.log("db connected")

export default db;