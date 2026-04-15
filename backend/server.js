import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use("/api/users", authRouter);

connectDB();

app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
