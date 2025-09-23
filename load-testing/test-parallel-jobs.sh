#!/bin/bash

# Parallel Load Testing Script for Kubs
# This script submits jobs in parallel to trigger HPA and create more pods
# Usage: ./test-parallel-jobs.sh [BASE_URL] [TOTAL_JOBS] [CONCURRENCY] [JOB_TYPE]

BASE_URL=${1:-"http://kubs.local:50036"}
TOTAL_JOBS=${2:-200}
CONCURRENCY=${3:-20}
JOB_TYPE=${4:-"bcrypt"}

echo "🚀 Parallel Load Testing - Triggering HPA"
echo "========================================"
echo "Target: $BASE_URL"
echo "Total Jobs: $TOTAL_JOBS"
echo "Concurrency: $CONCURRENCY"
echo "Job Type: $JOB_TYPE"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
SUCCESS_COUNT=0
FAILED_COUNT=0
TOTAL_TIME=0

# Function to submit a job
submit_job() {
    local job_id=$1
    local job_type=$2
    
    # Generate payload
    case $job_type in
        "prime")
            NUMBER=$((RANDOM % 100000 + 10000))
            COMPLEXITY=$((RANDOM % 10 + 5))
            PAYLOAD="{\"type\":\"prime\",\"payload\":{\"number\":$NUMBER,\"complexity\":$COMPLEXITY}}"
            ;;
        "bcrypt")
            ROUNDS=$((RANDOM % 5 + 10))
            PASSWORD="stresspass$job_id"
            PAYLOAD="{\"type\":\"bcrypt\",\"payload\":{\"password\":\"$PASSWORD\",\"rounds\":$ROUNDS}}"
            ;;
        "sort")
            ARRAY_SIZE=$((RANDOM % 2000 + 1000))
            ALGORITHM=$(["bubble", "quick", "merge"][RANDOM % 3])
            PAYLOAD="{\"type\":\"sort\",\"payload\":{\"array\":$ARRAY_SIZE,\"algorithm\":\"$ALGORITHM\"}}"
            ;;
    esac
    
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
    local time_total=$(echo "$response" | tail -n 1)
    
    if [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓${NC} Job $job_id: Submitted (${response_time}ms)"
        echo "SUCCESS" >> /tmp/parallel_test_results
    else
        echo -e "${RED}✗${NC} Job $job_id: Failed (HTTP $http_code, ${response_time}ms)"
        echo "FAILED" >> /tmp/parallel_test_results
    fi
}

# Function to run parallel jobs
run_parallel_jobs() {
    local jobs_per_worker=$((TOTAL_JOBS / CONCURRENCY))
    local remaining_jobs=$((TOTAL_JOBS % CONCURRENCY))
    
    echo -e "${YELLOW}🔄 Starting $CONCURRENCY parallel workers...${NC}"
    echo -e "${YELLOW}📊 Jobs per worker: $jobs_per_worker${NC}"
    echo ""
    
    # Clear results file
    > /tmp/parallel_test_results
    
    # Start workers
    for worker in $(seq 1 $CONCURRENCY); do
        {
            local worker_jobs=$jobs_per_worker
            if [ $worker -le $remaining_jobs ]; then
                worker_jobs=$((worker_jobs + 1))
            fi
            
            for job in $(seq 1 $worker_jobs); do
                local global_job_id=$(((worker - 1) * jobs_per_worker + job))
                submit_job $global_job_id $JOB_TYPE
                # Small random delay to spread load
                sleep $(echo "scale=3; $RANDOM/32767 * 0.5" | bc)
            done
        } &
    done
    
    # Wait for all workers to complete
    wait
}

# Function to monitor HPA
monitor_hpa() {
    echo -e "${BLUE}📊 Monitoring HPA and Pods...${NC}"
    echo ""
    
    # Check current pod count
    local current_pods=$(kubectl get pods -l app=worker --no-headers 2>/dev/null | wc -l)
    echo -e "Current Worker Pods: ${YELLOW}$current_pods${NC}"
    
    # Check HPA status
    echo -e "${BLUE}HPA Status:${NC}"
    kubectl get hpa worker-hpa 2>/dev/null || echo "HPA not found"
    
    echo ""
    echo -e "${BLUE}Queue Length:${NC}"
    curl -s "$BASE_URL/api/stats" 2>/dev/null | grep -o '"queue_length":[0-9]*' || echo "Stats not available"
    
    echo ""
}

# Main execution
echo -e "${YELLOW}🔍 Pre-test system status:${NC}"
monitor_hpa

echo -e "${YELLOW}🚀 Starting parallel load test...${NC}"
START_TIME=$(date +%s)

# Run parallel jobs
run_parallel_jobs

END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

# Count results
SUCCESS_COUNT=$(grep -c "SUCCESS" /tmp/parallel_test_results 2>/dev/null || echo 0)
FAILED_COUNT=$(grep -c "FAILED" /tmp/parallel_test_results 2>/dev/null || echo 0)

echo ""
echo -e "${YELLOW}🔍 Post-test system status:${NC}"
monitor_hpa

echo ""
echo "📊 Load Test Results:"
echo "===================="
echo -e "Total Jobs: ${BLUE}$TOTAL_JOBS${NC}"
echo -e "Successful: ${GREEN}$SUCCESS_COUNT${NC}"
echo -e "Failed: ${RED}$FAILED_COUNT${NC}"
echo -e "Success Rate: ${GREEN}$((SUCCESS_COUNT * 100 / TOTAL_JOBS))%${NC}"
echo -e "Total Time: ${YELLOW}${TOTAL_TIME}s${NC}"
echo -e "Jobs per Second: ${YELLOW}$((TOTAL_JOBS / TOTAL_TIME))${NC}"

if [ $SUCCESS_COUNT -eq $TOTAL_JOBS ]; then
    echo -e "\n${GREEN}🎉 All $TOTAL_JOBS jobs submitted successfully!${NC}"
else
    echo -e "\n${YELLOW}⚠️  Some jobs failed. Check the service logs.${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Monitor HPA scaling:${NC}"
echo "   kubectl get hpa worker-hpa -w"
echo "   kubectl get pods -l app=worker -w"
echo ""
echo -e "${BLUE}📊 Check queue status:${NC}"
echo "   curl $BASE_URL/api/stats"

# Cleanup
rm -f /tmp/parallel_test_results
