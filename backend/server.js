import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// allow both local frontend and deployed frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://mern-auth-five-mu.vercel.app",
];

const app = express();

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/users", authRouter);

connectDB();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server started at port ${PORT}`);
});
