#!/bin/bash

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
