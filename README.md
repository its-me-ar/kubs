# Kubs - Job Processing System

A distributed job processing system built with Node.js, TypeScript, Redis, and Docker. The system consists of three microservices that work together to handle CPU-intensive tasks efficiently.

## Architecture

### Services

1. **Submitter Service** (Port 3000)
   - Job submission API
   - Validates and queues jobs
   - Tracks job status

2. **Workers Service** (Port 3001)
   - Processes CPU-intensive jobs
   - Exposes Prometheus metrics
   - Handles job execution

3. **Stats Service** (Port 3002)
   - Aggregates statistics from all services
   - Provides monitoring dashboard
   - Exposes Prometheus metrics

4. **Redis** (Port 6379)
   - Job queue storage
   - Inter-service communication
   - Data persistence

## Features

- **CPU-Intensive Job Processing**: Prime calculation, bcrypt hashing, array sorting
- **Real-time Monitoring**: Prometheus metrics and health checks
- **Scalable Architecture**: Microservices with Redis queue
- **API Documentation**: Swagger UI for all services
- **Docker Support**: Complete containerization
- **TypeScript**: Full type safety across all services

## Quick Start

### Using Docker Compose for Redis

```bash
# Start Redis only
docker-compose up -d

# View Redis logs
docker-compose logs -f redis

# Stop Redis
docker-compose down
```

### Start Node.js Services

```bash
# Install dependencies for each service
cd submitter && npm install && npm run build
cd ../workers && npm install && npm run build
cd ../stats && npm install && npm run build

# Start services (in separate terminals)
cd submitter && npm start
cd workers && npm start  
cd stats && npm start
```

## API Endpoints

### Submitter Service (Port 3000)
- `POST /api/jobs/submit` - Submit a new job
- `GET /api/jobs/:jobId` - Get job status
- `GET /health` - Health check
- `GET /api-docs` - Swagger documentation

### Workers Service (Port 3001)
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics
- `GET /api-docs` - Swagger documentation

### Stats Service (Port 3002)
- `GET /stats` - Aggregated statistics
- `GET /metrics` - Prometheus metrics
- `GET /health` - Health check
- `GET /api-docs` - Swagger documentation

## Job Types

1. **Prime Calculation**: Calculate prime numbers up to a specified limit
2. **Bcrypt Hashing**: Hash passwords with configurable rounds
3. **Array Sorting**: Generate and sort large arrays

## Example Usage

```bash
# Submit a prime calculation job
curl -X POST http://localhost:3000/api/jobs/submit \
  -H "Content-Type: application/json" \
  -d '{"type": "prime", "payload": {"limit": 10000}}'

# Check job status
curl http://localhost:3000/api/jobs/{jobId}

# Get aggregated stats
curl http://localhost:3002/stats

# View Prometheus metrics
curl http://localhost:3002/metrics
```

## Monitoring

- **Service Health**: Each service exposes `/health` endpoint
- **Prometheus Metrics**: Available at `/metrics` endpoint for each service
- **Stats Dashboard**: Available at http://localhost:3002/stats

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Environment Variables

Create `.env` files in each service directory:

```env
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://127.0.0.1:6379
NODE_ENV=development
```

## Docker Commands

```bash
# Start Redis
docker-compose up -d

# View Redis logs
docker-compose logs -f redis

# Stop Redis
docker-compose down

# Check Redis status
docker-compose ps
```

## Project Structure

```
kubs/
├── docker-compose.yml          # Redis orchestration
├── submitter/                  # Job submission service
│   ├── src/
│   └── package.json
├── workers/                    # Job processing service
│   ├── src/
│   └── package.json
├── stats/                      # Statistics aggregation service
│   ├── src/
│   └── package.json
```

## License

MIT License - see LICENSE file for details.
