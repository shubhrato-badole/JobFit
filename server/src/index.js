import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import Resume from "./routes/resume.js"
import db from "./database.js"




dotenv.config()
const app = express();
const PORT = 3000

app.use(cors ({
    origin:"http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())


app.use("/api/auth", authRoutes  )
app.use("api/resume", Resume ) 


app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Something went wrong' })
})


app.listen(PORT , () => {
     console.log(`Server running on http://localhost:${PORT}`)
})