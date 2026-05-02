import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import Resume from "./routes/resume.js"
import helmet from "helmet"
import Analyzse from "./routes/jobanalysze.js"
import Tracker from "./routes/tracker.js"
import Dashboard from "./routes/dashboard.js" 
import passport from "passport"
import Jobsearch from "./routes/jobsearch.js"
import Profile from "./routes/profile.js"




dotenv.config()
const app = express();
app.use(helmet())

const PORT = 3000
app.use(passport.initialize())
app.use(cors ({
    origin:"http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())


app.use("/api/auth", authRoutes  )
app.use("/api/resume", Resume )
app.use("/api/ai" , Analyzse )
app.use("/api/tracker" , Tracker )
app.use("/api/dashboard" , Dashboard )
app.use("/api/jobs" , Jobsearch )
app.use("/api/profile" , Profile )

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Something went wrong' })
})


app.listen(PORT , () => {
     console.log(`Server running on http://localhost:${PORT}`)
})