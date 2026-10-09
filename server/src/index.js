
import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import passport from "passport";
import authRoutes from "./routes/auth.js";
import Resume from "./routes/resume.js";
import Analyzse from "./routes/jobanalysze.js";
import Tracker from "./routes/tracker.js";
import Dashboard from "./routes/dashboard.js";
import Jobsearch from "./routes/jobsearch.js";
import Profile from "./routes/profile.js";
import Admin from "./routes/admin.js";
import ChatBot from "./routes/ChatBot.js";

import responseTime from "./middleware/responseTime.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Trust the proxy when deployed behind Render's proxy.
app.set("trust proxy", 1);

// Request timing and security middleware.
app.use(responseTime);
app.use(helmet());

// Initialize Passport.
app.use(passport.initialize());

// Configure CORS.
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permit requests without an Origin header, such as curl.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Parse request bodies and cookies.
app.use(express.json());
app.use(cookieParser());

// Register application routes.
app.use("/api/auth", authRoutes);
app.use("/api/resume", Resume);
app.use("/api/ai", Analyzse);
app.use("/api/tracker", Tracker);
app.use("/api/dashboard", Dashboard);
app.use("/api/jobs", Jobsearch);
app.use("/api/profile", Profile);
app.use("/api/admin", Admin);
app.use("/api/chat", ChatBot);

// Handle errors.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.message === "Not allowed by CORS" ? 403 : 500;

  return res.status(status).json({
    error:
      status === 403
        ? "Origin not allowed"
        : "Something went wrong",
  });
});

// Start the server.
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
