import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Stats Service API',
      version: '1.0.0',
      description: 'API for aggregating statistics from submitter and workers services',
      contact: {
        name: 'Ashish Ranjan',
        email: 'ashish.ranjan@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Stats',
        description: 'Statistics aggregation operations',
      },
      {
        name: 'Health',
        description: 'Health check and service information',
      },
    ],
    components: {
      schemas: {
        JobStats: {
          type: 'object',
          properties: {
            totalJobsSubmitted: { type: 'number' },
            totalJobsCompleted: { type: 'number' },
            totalJobsFailed: { type: 'number' },
            totalJobsProcessing: { type: 'number' },
            totalJobsQueued: { type: 'number' },
            averageProcessingTime: { type: 'number' },
            queueLength: { type: 'number' },
          },
        },
        ServiceStats: {
          type: 'object',
          properties: {
            submitter: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                uptime: { type: 'number' },
              },
            },
            workers: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                uptime: { type: 'number' },
                jobsProcessed: { type: 'number' },
                jobErrors: { type: 'number' },
              },
            },
            redis: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                connected: { type: 'boolean' },
              },
            },
          },
        },
        StatsResponse: {
          type: 'object',
          properties: {
            timestamp: { type: 'string', format: 'date-time' },
            jobStats: { '$ref': '#/components/schemas/JobStats' },
            serviceStats: { '$ref': '#/components/schemas/ServiceStats' },
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
