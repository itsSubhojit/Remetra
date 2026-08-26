import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { errorHandler } from "./src/middlewares/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler)


export default app