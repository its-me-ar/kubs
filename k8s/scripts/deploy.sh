#!/bin/bash

# Get the directory where the script is located and go to parent (k8s directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"
cd "$K8S_DIR"

# Kubernetes deployment script for kubs microservices
echo "🚀 Deploying kubs microservices to Kubernetes..."

# Check if minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo "❌ Minikube is not running. Please start minikube first:"
    echo "   minikube start"
    exit 1
fi

echo "✅ Minikube is running"

# Build and load Docker images
echo "🐳 Building Docker images..."
cd ..

# Build images
echo "   Building submitter image..."
docker build -t kubs-submitter ./submitter

echo "   Building workers image..."
docker build -t kubs-workers ./workers

echo "   Building stats image..."
docker build -t kubs-stats ./stats

# Load images into Minikube
echo "📦 Loading images into Minikube..."
minikube image load kubs-submitter
minikube image load kubs-workers
minikube image load kubs-stats

echo "✅ Docker images built and loaded successfully"

# Go back to k8s directory
cd k8s

# Create ConfigMap first
echo "📋 Creating ConfigMap..."
kubectl apply -f configmap.yaml

# Deploy Redis (required by other services)
echo "📦 Deploying Redis..."
kubectl apply -f redis.yaml

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/redis || echo "⚠️  Redis deployment ready check timed out"

# Deploy other services
echo "📦 Deploying Stats service..."
kubectl apply -f stats.yaml

echo "📦 Deploying Submitter service..."
kubectl apply -f submitter.yaml

echo "📦 Deploying Worker service..."
kubectl apply -f worker.yaml

# Deploy Ingress
echo "🌐 Deploying Ingress..."
kubectl apply -f ingress.yaml

echo "📈 Deploying HPA (Horizontal Pod Autoscaler)..."
kubectl apply -f hpa.yaml

# Wait for all deployments to be ready
echo "⏳ Waiting for all services to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/stats-deployment
kubectl wait --for=condition=available --timeout=300s deployment/submitter-deployment
kubectl wait --for=condition=available --timeout=300s deployment/worker-deployment

echo "✅ All services deployed successfully!"

# Show service status
echo "📊 Service Status:"
kubectl get services

echo "📊 Pod Status:"
kubectl get pods

# Get Ingress URL
echo ""
echo "🌐 Getting Ingress URL for external access..."
echo "   📡 Note: You'll need to run this command manually to get the URL:"
echo "   📡 minikube service ingress-nginx-controller -n ingress-nginx --url"
echo "   📡 The command will show URLs like: http://127.0.0.1:XXXXX"

echo ""
echo "🎉 Services are now accessible at:"
echo "   📝 Submitter Service (External): http://kubs.local:[PORT]"
echo "   📝 Alternative URLs:"
echo "      - http://api.kubs.local:[PORT]"
echo "      - http://health.kubs.local:[PORT]"
echo "   📝 Replace [PORT] with the port number from the minikube service command above"
echo ""
echo "   🔒 Internal Services (ClusterIP only):"
echo "   ⚙️  Worker Service:    ClusterIP (internal only)"
echo "   📊 Stats Service:     ClusterIP (internal only)"
echo ""
echo "💡 To get the correct Ingress URL:"
echo "   minikube service ingress-nginx-controller -n ingress-nginx --url"
echo "   (Keep this terminal open - the command needs to stay running)"
echo ""
echo "💡 Health check endpoints:"
echo "   External: http://kubs.local:[PORT]/health"
echo "   Internal: kubectl exec deployment/stats-deployment -- curl http://submitter-service:3000/health"
echo ""
echo "💡 Example usage:"
echo "   1. Run: minikube service ingress-nginx-controller -n ingress-nginx --url"
echo "   2. Copy the port number (e.g., 61787)"
echo "   3. Open: http://kubs.local:61787/health"
echo ""
echo "🔍 To view logs:"
echo "   kubectl logs -f deployment/submitter-deployment"
echo "   kubectl logs -f deployment/worker-deployment"
echo "   kubectl logs -f deployment/stats-deployment"
echo "   kubectl logs -f deployment/redis"
echo ""
echo "🛑 To stop all services:"
echo "   ./cleanup.sh"
