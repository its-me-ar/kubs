#!/bin/bash

# Get the directory where the script is located and go to parent (k8s directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"
cd "$K8S_DIR"

# Kubernetes cleanup script for kubs microservices
echo "🧹 Cleaning up kubs microservices from Kubernetes..."

# Stop any running port forwards (if any)
echo "🛑 Stopping any port forwarding..."
pkill -f "kubectl port-forward" 2>/dev/null || true
echo "   ✅ Port forwarding stopped"

# Delete deployments and services
echo "🗑️  Deleting services..."
kubectl delete -f worker.yaml
kubectl delete -f submitter.yaml
kubectl delete -f stats.yaml
kubectl delete -f redis.yaml
kubectl delete -f configmap.yaml
kubectl delete -f ingress.yaml
kubectl delete -f hpa.yaml

# Wait for cleanup
echo "⏳ Waiting for cleanup to complete..."
kubectl wait --for=delete --timeout=60s deployment/worker-deployment
kubectl wait --for=delete --timeout=60s deployment/submitter-deployment
kubectl wait --for=delete --timeout=60s deployment/stats-deployment
kubectl wait --for=delete --timeout=60s deployment/redis

echo "✅ Cleanup completed!"

# Show remaining resources
echo "📊 Remaining resources:"
kubectl get all

echo ""
echo "🎉 All services have been stopped!"
echo "   External access via Ingress is no longer available"
