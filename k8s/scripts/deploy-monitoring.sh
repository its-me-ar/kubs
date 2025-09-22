#!/bin/bash

# Deploy Prometheus and Grafana monitoring stack
set -e

echo "🚀 Deploying Prometheus and Grafana monitoring stack..."

# Add Prometheus Helm repository
echo "📦 Adding Prometheus Helm repository..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create monitoring namespace
echo "🏗️  Creating monitoring namespace..."
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Create Grafana admin secret
echo "🔐 Creating Grafana admin secret..."
kubectl apply -f ../grafana-secret.yaml

# Deploy Prometheus and Grafana
echo "📊 Deploying Prometheus and Grafana..."
if ! helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --values ../prometheus-values.yaml \
  --timeout 10m; then
  echo "❌ Failed to deploy Prometheus and Grafana"
  echo "🔍 Checking for common issues..."
  echo "📋 Checking if namespace exists:"
  kubectl get namespace monitoring
  echo "📋 Checking for existing releases:"
  helm list -n monitoring
  echo "📋 Checking for resource conflicts:"
  kubectl get all -n monitoring
  exit 1
fi

# Wait for pods to be ready
echo "⏳ Waiting for monitoring pods to be ready..."
echo "🔍 Checking Prometheus pods..."
if ! kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=prometheus -n monitoring --timeout=300s; then
  echo "⚠️  Prometheus pod ready check timed out"
  echo "📋 Checking Prometheus pod status:"
  kubectl get pods -l app.kubernetes.io/name=prometheus -n monitoring
  kubectl describe pods -l app.kubernetes.io/name=prometheus -n monitoring
fi

echo "🔍 Checking Grafana pods..."
if ! kubectl wait --for=condition=ready pod -l app.kubernetes.io/name=grafana -n monitoring --timeout=300s; then
  echo "⚠️  Grafana pod ready check timed out"
  echo "📋 Checking Grafana pod status:"
  kubectl get pods -l app.kubernetes.io/name=grafana -n monitoring
  kubectl describe pods -l app.kubernetes.io/name=grafana -n monitoring
fi

# Apply ServiceMonitors
echo "📡 Applying ServiceMonitors..."
kubectl apply -f ../servicemonitors.yaml

# Apply Grafana dashboard
echo "📈 Applying Grafana dashboard..."
kubectl apply -f ../grafana-dashboard-configmap.yaml

# Get access information
echo "✅ Monitoring stack deployed successfully!"
echo ""
echo "🔗 Access Information:"
echo ""

echo "📊 Grafana Dashboard:"
echo "   Username: admin"
echo "   Password: admin123"
echo "   Access via port-forward: kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80"
echo "   Then open: http://localhost:3000"
echo ""
echo "🔍 Prometheus UI:"
echo "   Access via port-forward: kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090"
echo "   Then open: http://localhost:9090"
echo ""
echo "📈 AlertManager:"
echo "   Access via port-forward: kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-alertmanager 9093:9093"
echo "   Then open: http://localhost:9093"
echo ""
echo "🎯 Your Kubs Application Metrics:"
echo "   - Stats Service: http://stats-service:3002/metrics"
echo "   - Worker Service: http://worker-service:3001/metrics"
echo ""
echo "💡 Quick Commands:"
echo "   Check pods: kubectl get pods -n monitoring"
echo "   Check services: kubectl get services -n monitoring"
echo "   View logs: kubectl logs -n monitoring -l app.kubernetes.io/name=grafana"
echo ""
echo "🚀 Ready to monitor!"
echo ""
echo "💡 Quick Access:"
echo "   Use access-monitoring.sh for port forwarding:"
echo "   ./access-monitoring.sh"
