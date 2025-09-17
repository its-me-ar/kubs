import express, { Request, Response } from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;
const NODE_ENV = process.env.NODE_ENV || "development";

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from Service : Stats 📊");
});

app.listen(PORT, () => {
  console.log(`✅ Service [Stats] running on port ${PORT} in ${NODE_ENV} mode`);
});
