import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { errorHandler } from "./src/middlewares/errorHandler.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(errorHandler)


export default app