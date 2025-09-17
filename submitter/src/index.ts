import express, { Request, Response } from "express";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello from Service : Job Submitter 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Service A running on port ${PORT} in ${NODE_ENV} mode`);
});
