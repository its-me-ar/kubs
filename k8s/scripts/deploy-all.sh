#!/bin/bash

# Deploy everything: kubs services + monitoring stack
set -e

echo "🚀 Deploying complete kubs stack with monitoring..."

# Get the directory where the script is located and go to parent (k8s directory)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
K8S_DIR="$(dirname "$SCRIPT_DIR")"
cd "$K8S_DIR"

# Check if minikube is running
if ! minikube status > /dev/null 2>&1; then
    echo "❌ Minikube is not running. Please start minikube first:"
    echo "   minikube start"
    exit 1
fi

echo "✅ Minikube is running"

# Deploy kubs services
echo "📦 Deploying kubs microservices..."
./scripts/deploy.sh

echo ""
echo "📊 Deploying monitoring stack..."
./scripts/deploy-monitoring.sh

echo ""
echo "🎉 Complete deployment finished!"
echo ""
echo "🔗 Access Information:"
echo ""
echo "📝 Kubs Services:"
echo "   - Run: minikube service ingress-nginx-controller -n ingress-nginx --url"
echo "   - Then access: http://kubs.local:[PORT]"
echo ""
echo "📊 Monitoring Services:"
echo "   - Run: ./scripts/access-monitoring.sh"
echo "   - Prometheus: http://localhost:9090"
echo "   - Grafana: http://localhost:3000 (admin/admin123)"
echo ""
echo "🛑 To stop everything:"
echo "   ./scripts/cleanup.sh"
echo "   ./scripts/cleanup-monitoring.sh"
