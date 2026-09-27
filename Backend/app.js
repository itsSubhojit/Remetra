import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import "./src/config/firebase.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import paymentRouter from "./src/routes/paymentRoutes.js"
import contactRouter from "./src/routes/contactRoutes.js";

const app = express();

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
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Remetra Backend API is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/payments", paymentRouter);
app.use("/payments", paymentRouter);
app.use("/api/contact", contactRouter);
app.use("/contact", contactRouter);

app.use(errorHandler);

export default app;