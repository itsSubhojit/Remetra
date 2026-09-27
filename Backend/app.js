import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import "./src/config/firebase.js";
import { errorHandler } from "./src/middlewares/errorHandler.js";
import paymentRouter from "./src/routes/paymentRoutes.js"


const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Remetra Backend API is running" });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/payments", paymentRouter);
app.use("/payments", paymentRouter);

app.use(errorHandler);

export default app;