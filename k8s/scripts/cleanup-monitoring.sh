#!/bin/bash

# Cleanup Prometheus and Grafana monitoring stack
set -e

echo "🧹 Cleaning up Prometheus and Grafana monitoring stack..."

# Remove Helm release
echo "🗑️  Removing Prometheus Helm release..."
helm uninstall prometheus -n monitoring || true

# Delete monitoring namespace
echo "🗑️  Deleting monitoring namespace..."
kubectl delete namespace monitoring --ignore-not-found=true

# Remove ServiceMonitors
echo "🗑️  Removing ServiceMonitors..."
kubectl delete -f ../servicemonitors.yaml --ignore-not-found=true

# Remove Grafana dashboard
echo "🗑️  Removing Grafana dashboard..."
kubectl delete -f ../grafana-dashboard-configmap.yaml --ignore-not-found=true

# Remove Grafana secret
echo "🗑️  Removing Grafana secret..."
kubectl delete -f ../grafana-secret.yaml --ignore-not-found=true

# Clean up any remaining resources
echo "🧹 Cleaning up any remaining resources..."
kubectl delete all --all -n monitoring --ignore-not-found=true || true
kubectl delete pvc --all -n monitoring --ignore-not-found=true || true

echo "✅ Monitoring stack cleanup completed!"
echo ""
echo "💡 To verify cleanup:"
echo "   kubectl get namespaces | grep monitoring"
echo "   kubectl get all -n monitoring"
