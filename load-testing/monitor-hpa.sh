#!/bin/bash

# HPA and Pod Monitoring Script
# Usage: ./monitor-hpa.sh [REFRESH_INTERVAL]

REFRESH_INTERVAL=${1:-5}

echo "📊 HPA and Pod Monitoring"
echo "========================"
echo "Refresh interval: ${REFRESH_INTERVAL}s"
echo "Press Ctrl+C to stop"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

while true; do
    clear
    echo "📊 HPA and Pod Monitoring - $(date)"
    echo "=================================="
    echo ""
    
    # HPA Status
    echo -e "${BLUE}HPA Status:${NC}"
    kubectl get hpa worker-hpa 2>/dev/null || echo "HPA not found"
    echo ""
    
    # Pod Status
    echo -e "${BLUE}Worker Pods:${NC}"
    kubectl get pods -l app=worker -o wide 2>/dev/null || echo "No worker pods found"
    echo ""
    
    # Pod Count
    local pod_count=$(kubectl get pods -l app=worker --no-headers 2>/dev/null | wc -l)
    echo -e "${YELLOW}Total Worker Pods: $pod_count${NC}"
    echo ""
    
    # Queue Length
    echo -e "${BLUE}Queue Status:${NC}"
    curl -s "http://kubs.local:50036/api/stats" 2>/dev/null | grep -o '"queue_length":[0-9]*' || echo "Stats not available"
    echo ""
    
    # CPU Usage
    echo -e "${BLUE}CPU Usage:${NC}"
    kubectl top pods -l app=worker 2>/dev/null || echo "CPU stats not available"
    echo ""
    
    # Memory Usage
    echo -e "${BLUE}Memory Usage:${NC}"
    kubectl top pods -l app=worker --containers 2>/dev/null || echo "Memory stats not available"
    echo ""
    
    echo "Refreshing in ${REFRESH_INTERVAL}s... (Press Ctrl+C to stop)"
    sleep $REFRESH_INTERVAL
done
