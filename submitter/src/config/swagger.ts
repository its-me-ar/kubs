import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Submitter API',
      version: '1.0.0',
      description: 'API Gateway for submitting CPU-intensive jobs to worker services',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Jobs',
        description: 'Job management operations'
      },
      {
        name: 'Health',
        description: 'Health check operations'
      }
    ],
    components: {
      schemas: {
        Job: {
          type: 'object',
          properties: {
            jobId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique job identifier'
            },
            status: {
              type: 'string',
              enum: ['queued', 'processing', 'completed', 'failed'],
              description: 'Current job status'
            },
            type: {
              type: 'string',
              enum: ['prime', 'bcrypt', 'sort'],
              description: 'Type of job to process'
            },
            payload: {
              type: 'object',
              description: 'Additional data for the job'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Job creation timestamp'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Job last update timestamp'
            },
            result: {
              type: 'object',
              description: 'Job processing result'
            },
            error: {
              type: 'string',
              description: 'Error message if job failed'
            }
          }
        },
        SubmitJobRequest: {
          type: 'object',
          required: ['type'],
          properties: {
            type: {
              type: 'string',
              enum: ['prime', 'bcrypt', 'sort'],
              description: 'Type of job to process'
            },
            payload: {
              type: 'object',
              description: 'Additional data for the job'
            }
          }
        },
        SubmitJobResponse: {
          type: 'object',
          properties: {
            jobId: {
              type: 'string',
              format: 'uuid',
              description: 'Unique job identifier'
            },
            status: {
              type: 'string',
              example: 'queued',
              description: 'Job status'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Job Submitter API Documentation'
  }));
};
