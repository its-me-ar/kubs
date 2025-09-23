#!/bin/bash

# Extreme Load Testing Script - Maximum HPA Triggering
# This script creates extreme load to force HPA scaling
# Usage: ./test-extreme-load.sh [BASE_URL] [DURATION_SECONDS] [CONCURRENCY]

BASE_URL=${1:-"http://kubs.local:50036"}
DURATION=${2:-300}  # 5 minutes
CONCURRENCY=${3:-50}

echo "🔥 EXTREME LOAD TESTING - MAXIMUM HPA TRIGGERING"
echo "==============================================="
echo "Target: $BASE_URL"
echo "Duration: ${DURATION}s"
echo "Concurrency: $CONCURRENCY"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED_BG='\033[41m'
NC='\033[0m'

# Counters
TOTAL_JOBS=0
SUCCESS_COUNT=0
FAILED_COUNT=0

# Function to submit a job
submit_job() {
    local job_id=$1
    
    # Generate heavy BCrypt job (CPU intensive)
    ROUNDS=$((RANDOM % 3 + 12))  # 12-14 rounds (very heavy)
    PASSWORD="extremepass$job_id"
    PAYLOAD="{\"type\":\"bcrypt\",\"payload\":{\"password\":\"$PASSWORD\",\"rounds\":$ROUNDS}}"
    
    # Submit job
    local start_time=$(date +%s%3N)
    local response=$(curl -s -w "\n%{http_code}\n%{time_total}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD" \
        "$BASE_URL/api/jobs" 2>/dev/null)
    
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))
    
    # Parse response
    local http_code=$(echo "$response" | tail -n 2 | head -n 1)
    
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓${NC} Job $job_id: Submitted (${response_time}ms)"
        echo "SUCCESS" >> /tmp/extreme_test_results
    else
        echo -e "${RED}✗${NC} Job $job_id: Failed (HTTP $http_code, ${response_time}ms)"
        echo "FAILED" >> /tmp/extreme_test_results
    fi
}

# Function to run extreme load
run_extreme_load() {
    local end_time=$(($(date +%s) + DURATION))
    local job_id=1
    
    echo -e "${RED_BG}🔥 STARTING EXTREME LOAD - ${CONCURRENCY} CONCURRENT WORKERS${NC}"
    echo ""
    
    # Clear results file
    > /tmp/extreme_test_results
    
    # Start extreme load
    while [ $(date +%s) -lt $end_time ]; do
        # Start CONCURRENCY jobs simultaneously
        for worker in $(seq 1 $CONCURRENCY); do
            {
                submit_job $job_id
                TOTAL_JOBS=$((TOTAL_JOBS + 1))
                job_id=$((job_id + 1))
            } &
        done
        
        # Wait for all jobs to complete before starting next batch
        wait
        
        # Small delay between batches
        sleep 0.1
    done
}

# Function to monitor system
monitor_system() {
    echo -e "${BLUE}📊 System Status:${NC}"
    
    # Check pod count
    local current_pods=$(kubectl get pods -l app=worker --no-headers 2>/dev/null | wc -l)
    echo -e "Worker Pods: ${YELLOW}$current_pods${NC}"
    
    # Check HPA
    echo -e "${BLUE}HPA Status:${NC}"
    kubectl get hpa worker-hpa 2>/dev/null || echo "HPA not found"
    
    # Check queue length
    echo -e "${BLUE}Queue Length:${NC}"
    curl -s "$BASE_URL/api/stats" 2>/dev/null | grep -o '"queue_length":[0-9]*' || echo "Stats not available"
    
    # Check CPU usage
    echo -e "${BLUE}CPU Usage:${NC}"
    kubectl top pods -l app=worker 2>/dev/null || echo "CPU stats not available"
    
    echo ""
}

# Function to show real-time stats
show_stats() {
    while true; do
        sleep 10
        local current_success=$(grep -c "SUCCESS" /tmp/extreme_test_results 2>/dev/null || echo 0)
        local current_failed=$(grep -c "FAILED" /tmp/extreme_test_results 2>/dev/null || echo 0)
        local current_total=$((current_success + current_failed))
        
        echo -e "${YELLOW}📊 Real-time Stats: ${current_total} jobs, ${current_success} success, ${current_failed} failed${NC}"
        
        # Show pod count
        local current_pods=$(kubectl get pods -l app=worker --no-headers 2>/dev/null | wc -l)
        echo -e "${BLUE}📦 Current Pods: ${current_pods}${NC}"
    done
}

# Main execution
echo -e "${YELLOW}🔍 Pre-test system status:${NC}"
monitor_system

echo -e "${YELLOW}🚀 Starting extreme load test...${NC}"
echo -e "${RED}⚠️  WARNING: This will create extreme load on your system!${NC}"
echo ""

# Start stats monitoring in background
show_stats &
STATS_PID=$!

# Run extreme load
START_TIME=$(date +%s)
run_extreme_load
END_TIME=$(date +%s)

# Stop stats monitoring
kill $STATS_PID 2>/dev/null

TOTAL_TIME=$((END_TIME - START_TIME))

# Count results
SUCCESS_COUNT=$(grep -c "SUCCESS" /tmp/extreme_test_results 2>/dev/null || echo 0)
FAILED_COUNT=$(grep -c "FAILED" /tmp/extreme_test_results 2>/dev/null || echo 0)

echo ""
echo -e "${YELLOW}🔍 Post-test system status:${NC}"
monitor_system

echo ""
echo "📊 Extreme Load Test Results:"
echo "============================="
echo -e "Total Jobs: ${BLUE}$TOTAL_JOBS${NC}"
echo -e "Successful: ${GREEN}$SUCCESS_COUNT${NC}"
echo -e "Failed: ${RED}$FAILED_COUNT${NC}"
echo -e "Success Rate: ${GREEN}$((SUCCESS_COUNT * 100 / TOTAL_JOBS))%${NC}"
echo -e "Total Time: ${YELLOW}${TOTAL_TIME}s${NC}"
echo -e "Jobs per Second: ${YELLOW}$((TOTAL_JOBS / TOTAL_TIME))${NC}"

if [ $SUCCESS_COUNT -gt 0 ]; then
    echo -e "\n${GREEN}🎉 Extreme load test completed!${NC}"
else
    echo -e "\n${RED}❌ All jobs failed. Check system status.${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Monitor HPA scaling:${NC}"
echo "   kubectl get hpa worker-hpa -w"
echo "   kubectl get pods -l app=worker -w"
echo ""
echo -e "${BLUE}📊 Check queue status:${NC}"
echo "   curl $BASE_URL/api/stats"

# Cleanup
rm -f /tmp/extreme_test_results
