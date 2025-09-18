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
- **Multiple Deployment Options**: Kubernetes and simple Docker setups

## Deployment Options

This project supports two deployment methods:

1. **🚀 Kubernetes Deployment** - Production-ready with auto-scaling, ingress, and monitoring
2. **🐳 Simple Deployment** - Quick setup with Docker Compose and manual service startup

Choose the deployment method that best fits your needs:

| Feature | Kubernetes | Simple |
|---------|------------|--------|
| **Setup Time** | 10-15 minutes | 2-5 minutes |
| **Auto-scaling** | ✅ Automatic HPA (2-10 pods) | ❌ Manual |
| **Load Balancing** | ✅ Ingress + LoadBalancer | ❌ None |
| **Monitoring** | ✅ Built-in | ⚠️ Basic |
| **Production Ready** | ✅ Yes | ⚠️ Development |
| **Resource Usage** | Higher | Lower |
| **Learning Curve** | Steeper | Gentle |

## Quick Start

### Option 1: Kubernetes Deployment (Recommended for Production)

**Prerequisites:**
- Minikube installed and running
- kubectl configured
- Ingress controller enabled

```bash
# Start Minikube
minikube start

# Enable ingress
minikube addons enable ingress

# Deploy all services
cd k8s
./scripts/deploy.sh

# Get access URL
minikube service ingress-nginx-controller -n ingress-nginx --url
```

**Access the application:**
- Add to `/etc/hosts`: `127.0.0.1 kubs.local api.kubs.local health.kubs.local`
- Visit: `http://kubs.local:[PORT]/health`

### Option 2: Simple Deployment (Quick Development)

**Using Docker Compose for Redis:**

```bash
# Start Redis only
docker-compose up -d

# View Redis logs
docker-compose logs -f redis

# Stop Redis
docker-compose down
```

**Start Node.js Services:**

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

## Detailed Deployment Guides

### 🚀 Kubernetes Deployment

The Kubernetes deployment provides a production-ready setup with auto-scaling, ingress, and comprehensive monitoring.

#### Prerequisites

1. **Minikube** installed and running
2. **kubectl** configured
3. **Ingress controller** enabled
4. **Docker** installed (for building images)

#### Setup Steps

```bash
# 1. Start Minikube
minikube start

# 2. Enable ingress addon
minikube addons enable ingress

# 3. Deploy all services (Docker images will be built automatically)
cd k8s
./scripts/deploy.sh

# 4. Get access URL
minikube service ingress-nginx-controller -n ingress-nginx --url
```

#### Domain Configuration

Add these entries to your `/etc/hosts` file:
```
127.0.0.1 kubs.local api.kubs.local health.kubs.local
```

#### Architecture

The Kubernetes deployment uses a **hybrid architecture**:

- **External Access**: Submitter service exposed via Ingress + LoadBalancer
- **Internal Access**: Stats, Workers, and Redis services use ClusterIP (internal only)
- **Auto-scaling**: Worker service automatically scales from 2-10 pods based on CPU usage (70% threshold)
- **Security**: Only the API gateway (submitter) is accessible from outside the cluster

#### Monitoring and Management

```bash
# View all services
kubectl get all

# Check pod status
kubectl get pods

# View logs
kubectl logs -f deployment/submitter-deployment
kubectl logs -f deployment/worker-deployment
kubectl logs -f deployment/stats-deployment

# Monitor HPA (Horizontal Pod Autoscaler)
kubectl get hpa
kubectl describe hpa worker-hpa

# Check resource usage
kubectl top pods

# Clean up everything
./scripts/cleanup.sh
```

#### Accessing Services

**External (Submitter Service):**
- Health: `http://kubs.local:[PORT]/health`
- API: `http://api.kubs.local:[PORT]/api/jobs`
- Docs: `http://kubs.local:[PORT]/api-docs`

**Internal (for debugging):**
```bash
# Stats service
kubectl port-forward service/stats-service 3002:3002
curl http://localhost:3002/stats

# Worker service
kubectl port-forward service/worker-service 3001:3001
curl http://localhost:3001/health
```

### 🐳 Simple Deployment

The simple deployment is perfect for development, testing, and quick prototyping.

#### Prerequisites

- Docker and Docker Compose
- Node.js 18+ and npm
- Git

#### Setup Steps

**1. Start Redis with Docker Compose:**

```bash
# Create docker-compose.yml (if not exists)
cat > docker-compose.yml << EOF
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  redis_data:
EOF

# Start Redis
docker-compose up -d

# Verify Redis is running
docker-compose ps
```

**2. Build and Start Services:**

```bash
# Install dependencies and build all services
for service in submitter workers stats; do
  echo "Building $service..."
  cd $service
  npm install
  npm run build
  cd ..
done

# Start services (in separate terminals)
# Terminal 1 - Submitter
cd submitter && npm start

# Terminal 2 - Workers  
cd workers && npm start

# Terminal 3 - Stats
cd stats && npm start
```

**3. Verify Services:**

```bash
# Check all services are running
curl http://localhost:3000/health  # Submitter
curl http://localhost:3001/health  # Workers
curl http://localhost:3002/health  # Stats
```

#### Environment Configuration

Create `.env` files in each service directory:

**submitter/.env:**
```env
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://127.0.0.1:6379
NODE_ENV=development
```

**workers/.env:**
```env
PORT=3001
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://127.0.0.1:6379
NODE_ENV=development
```

**stats/.env:**
```env
PORT=3002
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://127.0.0.1:6379
NODE_ENV=development
```

## Example Usage

### Kubernetes Deployment

```bash
# Submit a prime calculation job
curl -X POST http://kubs.local:55638/api/jobs/submit \
  -H "Content-Type: application/json" \
  -d '{"type": "prime", "payload": {"limit": 10000}}'

# Check job status
curl http://kubs.local:55638/api/jobs/{jobId}

# Get aggregated stats (internal access)
kubectl port-forward service/stats-service 3002:3002 &
curl http://localhost:3002/stats
```

### Simple Deployment

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

### Kubernetes Deployment
- **Service Health**: Each service exposes `/health` endpoint
- **Prometheus Metrics**: Available at `/metrics` endpoint for each service
- **Stats Dashboard**: Internal access via port-forward
- **Auto-scaling**: HPA automatically monitors CPU usage and scales workers (2-10 pods)
- **Resource Monitoring**: `kubectl top pods` for real-time resource usage
- **Log Aggregation**: `kubectl logs` for centralized logging

### Simple Deployment
- **Service Health**: Each service exposes `/health` endpoint
- **Prometheus Metrics**: Available at `/metrics` endpoint for each service
- **Stats Dashboard**: Available at http://localhost:3002/stats
- **Manual Scaling**: Start/stop worker processes manually
- **Individual Logs**: Check logs in each service directory

## When to Use Each Deployment

### Choose Kubernetes When:
- ✅ **Production environments** requiring high availability
- ✅ **Automatic scaling** based on load is needed
- ✅ **Load balancing** and traffic management required
- ✅ **Monitoring and observability** are critical
- ✅ **Team has Kubernetes expertise**
- ✅ **Multi-environment deployments** (dev/staging/prod)
- ✅ **Resource optimization** and cost management

### Choose Simple Deployment When:
- ✅ **Development and testing** environments
- ✅ **Quick prototyping** and experimentation
- ✅ **Learning and understanding** the system
- ✅ **Limited resources** or simple setups
- ✅ **No Kubernetes expertise** available
- ✅ **Single-machine deployments**
- ✅ **CI/CD pipelines** for testing

## Development

### For Kubernetes Development
```bash
# Build and test locally first
cd submitter && npm install && npm run build && npm test
cd ../workers && npm install && npm run build && npm test
cd ../stats && npm install && npm run build && npm test

# Deploy to Kubernetes
cd k8s
./scripts/deploy.sh

# Test the deployment
curl http://kubs.local:[PORT]/health
```

### For Simple Development
```bash
# Install dependencies for all services
for service in submitter workers stats; do
  cd $service
  npm install
  npm run build
  cd ..
done

# Start Redis
docker-compose up -d

# Start services in development mode
cd submitter && npm run dev &
cd workers && npm run dev &
cd stats && npm run dev &
```

## Environment Variables

### Kubernetes Deployment
Environment variables are managed via ConfigMap in `k8s/configmap.yaml`. No manual `.env` files needed.

### Simple Deployment
Create `.env` files in each service directory:

**submitter/.env:**
```env
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://127.0.0.1:6379
NODE_ENV=development
```

**workers/.env:**
```env
PORT=3001
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://127.0.0.1:6379
NODE_ENV=development
```

**stats/.env:**
```env
PORT=3002
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_URL=redis://127.0.0.1:6379
NODE_ENV=development
```

## Docker Commands

### Simple Deployment
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

### Kubernetes Deployment
```bash
# Deploy to Kubernetes (Docker images built automatically)
cd k8s
./scripts/deploy.sh

# Manual image building (if needed)
docker build -t kubs-submitter ./submitter
docker build -t kubs-workers ./workers
docker build -t kubs-stats ./stats

# Load images into Minikube (if needed)
minikube image load kubs-submitter
minikube image load kubs-workers
minikube image load kubs-stats
```

## Project Structure

```
kubs/
├── k8s/                        # Kubernetes deployment files
│   ├── scripts/
│   │   ├── deploy.sh          # Kubernetes deployment script
│   │   └── cleanup.sh         # Kubernetes cleanup script
│   ├── configmap.yaml         # Environment configuration
│   ├── hpa.yaml              # Horizontal Pod Autoscaler
│   ├── ingress.yaml          # Ingress configuration
│   ├── redis.yaml            # Redis service
│   ├── stats.yaml            # Stats service
│   ├── submitter.yaml        # Submitter service
│   ├── worker.yaml           # Worker service
│   └── README.md             # Kubernetes-specific docs
├── submitter/                  # Job submission service
│   ├── src/                   # TypeScript source code
│   ├── dist/                  # Compiled JavaScript
│   ├── Dockerfile            # Docker image definition
│   ├── package.json          # Dependencies and scripts
│   └── tsconfig.json         # TypeScript configuration
├── workers/                    # Job processing service
│   ├── src/                   # TypeScript source code
│   ├── dist/                  # Compiled JavaScript
│   ├── Dockerfile            # Docker image definition
│   ├── package.json          # Dependencies and scripts
│   └── tsconfig.json         # TypeScript configuration
├── stats/                      # Statistics aggregation service
│   ├── src/                   # TypeScript source code
│   ├── dist/                  # Compiled JavaScript
│   ├── Dockerfile            # Docker image definition
│   ├── package.json          # Dependencies and scripts
│   └── tsconfig.json         # TypeScript configuration
├── docker-compose.yml          # Redis orchestration (for simple deployment)
└── README.md                   # This documentation
```

## Troubleshooting

### Kubernetes Deployment Issues

**Services not starting:**
```bash
# Check pod status
kubectl get pods

# Check pod logs
kubectl logs -f deployment/submitter-deployment

# Check service endpoints
kubectl get endpoints

# Restart a deployment
kubectl rollout restart deployment/submitter-deployment
```

**Ingress not working:**
```bash
# Check ingress status
kubectl get ingress

# Check ingress controller
kubectl get pods -n ingress-nginx

# Verify domain resolution
nslookup kubs.local
```

**HPA not scaling:**
```bash
# Check HPA status
kubectl get hpa

# Check resource usage
kubectl top pods

# Check HPA events
kubectl describe hpa worker-hpa
```

### Simple Deployment Issues

**Redis connection issues:**
```bash
# Check Redis is running
docker-compose ps

# Check Redis logs
docker-compose logs redis

# Restart Redis
docker-compose restart redis
```

**Service connection issues:**
```bash
# Check if services are running
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3002/health

# Check service logs
tail -f submitter/logs/combined.log
tail -f workers/logs/combined.log
tail -f stats/logs/combined.log
```

**Port conflicts:**
```bash
# Check what's using the ports
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :6379

# Kill processes using the ports
kill -9 $(lsof -t -i:3000)
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test both deployment methods
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see LICENSE file for details.
