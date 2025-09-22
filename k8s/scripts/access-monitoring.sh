#!/bin/bash

# Access monitoring services (Prometheus and Grafana)
set -e

# Cleanup function for port forwards only
cleanup() {
    echo ""
    echo "🧹 Cleaning up port forwards..."
    pkill -f "kubectl port-forward.*9090" || true
    pkill -f "kubectl port-forward.*3000" || true
    echo "✅ Port forward cleanup completed"
    echo "💡 To clean up the entire monitoring stack, run: ./cleanup-monitoring.sh"
    exit 0
}

# Set up signal handlers for cleanup
trap cleanup SIGINT SIGTERM EXIT

echo "🔍 Starting monitoring access..."

# Kill any existing port forwards
echo "🧹 Cleaning up existing port forwards..."
pkill -f "kubectl port-forward.*9090" || true
pkill -f "kubectl port-forward.*3000" || true

sleep 2

# Start port forwards
echo "🚀 Starting port forwards..."

# Prometheus
echo "📊 Starting Prometheus port forward..."
kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090 &

# Grafana
echo "📈 Starting Grafana port forward..."
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80 &

# Note: Worker and Stats services are ClusterIP only - no port forwarding needed
# Prometheus scrapes them internally via ServiceMonitors

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 5

# Test services
echo "🧪 Testing services..."

# Test Prometheus
if curl -s http://localhost:9090/api/v1/targets > /dev/null; then
    echo "✅ Prometheus is accessible at http://localhost:9090"
else
    echo "❌ Prometheus is not accessible"
fi

# Test Grafana
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Grafana is accessible at http://localhost:3000"
else
    echo "❌ Grafana is not accessible"
fi

# Test Worker metrics via Prometheus (internal access)
echo "⚙️  Worker metrics are scraped internally by Prometheus"
echo "📊 Stats metrics are scraped internally by Prometheus"

echo ""
echo "🎉 Monitoring services are now accessible!"
echo ""
echo "🔗 Access URLs:"
echo "   📊 Prometheus: http://localhost:9090"
echo "   📈 Grafana:    http://localhost:3000"
echo ""
echo "🔒 Internal Services (ClusterIP only):"
echo "   ⚙️  Worker:     worker-service:3001/metrics (internal only)"
echo "   📊 Stats:      stats-service:3002/metrics (internal only)"
echo ""
echo "🔐 Grafana Credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📊 Prometheus Targets:"
echo "   - Check http://localhost:9090/targets"
echo "   - Look for 'worker-service' and 'stats-service' targets"
echo "   - Both should show as 'up' status"
echo ""
echo "📈 Grafana Dashboards:"
echo "   - Go to http://localhost:3000"
echo "   - Login with admin/admin123"
echo "   - Check the 'Kubs Application' dashboard"
echo ""
echo "🛑 To stop port forwards, press Ctrl+C"
echo "🧹 To clean up the entire monitoring stack, run:"
echo "   ./cleanup-monitoring.sh"
echo ""

# Keep the script running
echo "🔄 Port forwards are running... Press Ctrl+C to stop"
wait
