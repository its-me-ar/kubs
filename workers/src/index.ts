import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import routes from "./routes";
import queueService from "./services/queue.service";
import { setupSwagger } from "./config/swagger";
import logger from "./config/logger";


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(morgan('combined')); // Log HTTP requests
app.use(express.json());

// Swagger Documentation
setupSwagger(app);

// Routes
app.use(routes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await queueService.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await queueService.close();
  process.exit(0);
});

app.listen(PORT, () => {
  logger.info(`✅ Service [Workers] running on port ${PORT} in ${NODE_ENV} mode`);
});
