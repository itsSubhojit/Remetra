import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import "./src/config/firebase.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import { globalLimiter } from "./src/middlewares/rateLimiter.js";
import paymentRouter from "./src/routes/paymentRoutes.js";
import contactRouter from "./src/routes/contactRoutes.js";
import authRouter from "./src/routes/authRoutes.js";

const app = express();

// Trust reverse proxy (e.g. Render 1 hop) for secure client IP detection without spoofing
const trustProxySetting = process.env.TRUST_PROXY !== undefined
  ? (isNaN(Number(process.env.TRUST_PROXY)) ? process.env.TRUST_PROXY : Number(process.env.TRUST_PROXY))
  : 1;
app.set("trust proxy", trustProxySetting);

const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "https://remetra.vercel.app",
];

const envOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((origin) => origin.trim())
  : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy error: Origin not allowed by Remetra security policy."));
      }
    },
    credentials: true,
  })
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
    limit: "15mb"
  })
);

// Unthrottled health & root routes for Render container health probes
app.get("/", (req, res) => {
  res.json({ message: "Remetra Backend API is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global baseline rate limiter for all API endpoints
app.use(globalLimiter);

app.use("/api/payments", paymentRouter);
app.use("/payments", paymentRouter);
app.use("/api/contact", contactRouter);
app.use("/contact", contactRouter);
app.use("/api/auth", authRouter);
app.use("/auth", authRouter);

app.use(errorHandler);

export default app;