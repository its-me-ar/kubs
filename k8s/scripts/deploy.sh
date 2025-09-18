#!/bin/bash

# Kubernetes deployment script for kubs microservices
echo "🚀 Deploying kubs microservices to Kubernetes..."

# Check if minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo "❌ Minikube is not running. Please start minikube first:"
    echo "   minikube start"
    exit 1
fi

echo "✅ Minikube is running"

# Create ConfigMap first
echo "📋 Creating ConfigMap..."
kubectl apply -f configmap.yaml

# Deploy Redis (required by other services)
echo "📦 Deploying Redis..."
kubectl apply -f redis.yaml

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/redis

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
