import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Worker Service API',
      version: '1.0.0',
      description: 'API for processing CPU-intensive jobs from a Redis queue',
      contact: {
        name: 'Ashish Ranjan',
        email: 'ashish.ranjan@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check and metrics operations',
      },
    ],
    components: {
      schemas: {
        JobData: {
          type: 'object',
          required: ['type'],
          properties: {
            type: { type: 'string', enum: ['prime', 'bcrypt', 'sort'] },
            payload: { type: 'object' },
          },
        },
        JobResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            result: { type: 'object' },
            error: { type: 'string' },
            processingTime: { type: 'number' },
          },
        },
        HealthStatus: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            service: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: { type: 'number' },
            description: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css',
    customCss: '.swagger-ui .topbar { display: none }',
  }));
};