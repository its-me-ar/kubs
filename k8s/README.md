# Kubernetes Deployment for Kubs Microservices

This directory contains Kubernetes manifests for deploying the kubs microservices stack on Minikube.

## File Structure

```
k8s/
├── scripts/            # Deployment and management scripts
│   ├── deploy.sh       # Main deployment script
│   └── cleanup.sh      # Cleanup script
├── configmap.yaml      # Environment configuration
├── hpa.yaml           # Horizontal Pod Autoscaler for workers
├── ingress.yaml        # Ingress for submitter service
├── redis.yaml          # Redis service (ClusterIP)
├── stats.yaml          # Stats service (ClusterIP)
├── submitter.yaml      # Submitter service (Ingress)
├── worker.yaml         # Worker service (ClusterIP)
└── README.md           # This documentation
```

## Services

- **Redis**: Database and message broker (ClusterIP - internal only)
- **Stats Service**: Metrics and statistics service (ClusterIP - internal only)
- **Submitter Service**: Job submission service (Ingress + LoadBalancer - external access)
- **Worker Service**: Background job processing service (ClusterIP - internal only) with HPA (2-10 pods)

## Architecture

This deployment uses a **hybrid architecture**:

- **External Access**: Submitter service exposed via Ingress + LoadBalancer
- **Internal Access**: Stats, Workers, and Redis services use ClusterIP (internal only)
- **Security**: Only the API gateway (submitter) is accessible from outside the cluster
- **Performance**: Internal services communicate directly for optimal performance
- **Auto-scaling**: Worker service automatically scales based on CPU usage

## Auto-scaling (HPA)

The **Worker Service** includes Horizontal Pod Autoscaler (HPA) for automatic scaling:

- **Scale Range**: 2 → 10 pods
- **Trigger**: CPU usage > 70%
- **Scale Up**: Aggressive scaling (up to 100% increase per 15s)
- **Scale Down**: Conservative scaling (max 10% decrease per 60s)
- **Stabilization**: 60s scale-up, 300s scale-down windows

## Prerequisites

1. **Minikube** must be running
2. **kubectl** must be installed and configured
3. **Ingress controller** enabled in Minikube (`minikube addons enable ingress`)
4. **Docker images** built and loaded into Minikube
5. **Domain resolution** configured (add to `/etc/hosts`):
   ```
   127.0.0.1 kubs.local api.kubs.local health.kubs.local
   ```

## Quick Start

### Deploy All Services
```bash
./scripts/deploy.sh
```

### Clean Up All Services
```bash
./scripts/cleanup.sh
```

## Quick Example

After deployment, test the system:

```bash
# 1. Submit a job
curl -H "Content-Type: application/json" \
  -X POST http://kubs.local:55638/api/jobs \
  -d '{"type": "prime", "payload": {"number": 17}}'

# 2. Check job status (use jobId from response)
curl http://kubs.local:55638/api/jobs/{jobId}

# 3. View stats (internal access)
kubectl port-forward service/stats-service 3002:3002 &
curl http://localhost:3002/stats
```

### Manual Deployment

Deploy services in order (ConfigMap first, then Redis, then others):

```bash
# Create ConfigMap
kubectl apply -f configmap.yaml

# Deploy Redis
kubectl apply -f redis.yaml

# Wait for Redis to be ready
kubectl wait --for=condition=available --timeout=300s deployment/redis

# Deploy other services
kubectl apply -f stats.yaml
kubectl apply -f submitter.yaml
kubectl apply -f worker.yaml

# Deploy Ingress
kubectl apply -f ingress.yaml
```

## Accessing Services

### External Access (Submitter Service Only)
```bash
# Get Ingress URL
minikube service ingress-nginx-controller -n ingress-nginx --url

# Access via domain names (after adding to /etc/hosts)
curl http://kubs.local:55638/health
curl http://api.kubs.local:55638/api/jobs
curl http://health.kubs.local:55638/health
```

### Internal Access (For Development/Debugging)
```bash
# Stats Service
kubectl port-forward service/stats-service 3002:3002
curl http://localhost:3002/stats

# Worker Service  
kubectl port-forward service/worker-service 3001:3001
curl http://localhost:3001/health

# Redis (if needed)
kubectl port-forward service/redis-service 6379:6379
```

### API Endpoints

**Submitter Service (External):**
- `GET /health` - Health check
- `POST /api/jobs` - Submit job
- `GET /api/jobs/{jobId}` - Check job status
- `GET /api-docs` - API documentation

**Stats Service (Internal):**
- `GET /health` - Health check with dependencies
- `GET /stats` - Job and service statistics

**Worker Service (Internal):**
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## Monitoring

### View Logs
```bash
# All services
kubectl logs -f deployment/redis
kubectl logs -f deployment/stats-deployment
kubectl logs -f deployment/submitter-deployment
kubectl logs -f deployment/worker-deployment
```

### Check Status
```bash
# Pods
kubectl get pods

# Services
kubectl get services

# Deployments
kubectl get deployments
```

## Configuration

### ConfigMap
All services use a shared ConfigMap (`service-config`) with comprehensive configuration:

**Internal Service URLs (ClusterIP):**
- `SUBMITTER_SERVICE_URL=http://submitter-service:3000`
- `WORKERS_SERVICE_URL=http://worker-service:3001`
- `STATS_SERVICE_URL=http://stats-service:3002`

**External Access URLs (Ingress + LoadBalancer):**
- `EXTERNAL_SUBMITTER_URL=http://kubs.local`
- `EXTERNAL_API_URL=http://api.kubs.local`
- `EXTERNAL_HEALTH_URL=http://health.kubs.local`

**Redis Configuration:**
- `REDIS_URL=redis://redis-service:6379`
- `REDIS_HOST=redis-service`
- `REDIS_PORT=6379`

**Environment:**
- `NODE_ENV=production`
- `LOG_LEVEL=info`

**Health & Monitoring:**
- `HEALTH_CHECK_INTERVAL=30000`
- `HEALTH_CHECK_TIMEOUT=5000`
- `METRICS_ENABLED=true`
- `METRICS_PORT=9090`

**Job Processing:**
- `MAX_JOBS_PER_WORKER=10`
- `JOB_TIMEOUT=300000`

**CORS Configuration:**
- `CORS_ORIGIN=*`
- `CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS`
- `CORS_HEADERS=DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization`

### Environment Variables
Each service has specific port configurations:
- **Submitter**: `PORT=3000`
- **Worker**: `PORT=3001`
- **Stats**: `PORT=3002`
- **Redis**: `6379`

### Resource Limits
Each service has:
- **Requests**: 256Mi memory, 200m CPU
- **Limits**: 512Mi memory, 500m CPU

## Troubleshooting

### Check Pod Status
```bash
kubectl describe pod <pod-name>
```

### Check Service Endpoints
```bash
kubectl get endpoints
```

### Check ConfigMaps
```bash
kubectl get configmaps
kubectl describe configmap service-config
```

### Check Ingress
```bash
kubectl get ingress
kubectl describe ingress submitter-ingress
```

### Restart Services
```bash
kubectl rollout restart deployment/redis
kubectl rollout restart deployment/stats-deployment
kubectl rollout restart deployment/submitter-deployment
kubectl rollout restart deployment/worker-deployment
```

## Monitoring HPA

Monitor the Horizontal Pod Autoscaler:

```bash
# Check HPA status
kubectl get hpa

# Detailed HPA information
kubectl describe hpa worker-hpa

# Monitor worker pod resource usage
kubectl top pods -l app=worker

# Watch HPA events
kubectl get events --sort-by=.metadata.creationTimestamp
```

## Architecture Notes

- **Hybrid Architecture**: Submitter exposed externally, others internal only
- **Security**: Only API gateway accessible from outside cluster
- **Performance**: Internal services communicate directly
- **Scalability**: LoadBalancer handles external traffic + HPA for workers
- **Monitoring**: Stats service monitors all services internally

## Development Notes

- **Docker Images**: Must be built and loaded into Minikube
- **Domain Resolution**: Requires `/etc/hosts` configuration
- **Port Forwarding**: Available for internal service debugging
- **Health Checks**: All services have comprehensive health endpoints
- **Resource Limits**: Configured for development workloads
