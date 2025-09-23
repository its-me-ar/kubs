#!/bin/bash

# Kubs Load Testing Runner
# Interactive script to run different load tests

echo "🚀 Kubs Load Testing Suite"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Default values
BASE_URL="http://kubs.local:50036"
JOB_TYPE="bcrypt"

echo -e "${BLUE}Choose your load test:${NC}"
echo "1. Basic Load Test (100 jobs sequentially)"
echo "2. Parallel Load Test (HPA triggering)"
echo "3. Extreme Load Test (Maximum HPA scaling)"
echo "4. Monitor HPA (Real-time monitoring)"
echo "5. Custom Load Test"
echo ""

read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo -e "${YELLOW}🚀 Running Basic Load Test...${NC}"
        echo "Job Type: $JOB_TYPE"
        echo ""
        node test-100-jobs.js "$BASE_URL" "$JOB_TYPE"
        ;;
    2)
        echo -e "${YELLOW}🚀 Running Parallel Load Test...${NC}"
        echo "This will trigger HPA scaling"
        echo ""
        read -p "Total jobs (default 200): " total_jobs
        total_jobs=${total_jobs:-200}
        
        read -p "Concurrency (default 30): " concurrency
        concurrency=${concurrency:-30}
        
        echo "Running: $total_jobs jobs with $concurrency concurrent workers"
        echo ""
        node test-parallel-jobs.js "$BASE_URL" "$total_jobs" "$concurrency" "$JOB_TYPE"
        ;;
    3)
        echo -e "${RED}🔥 Running Extreme Load Test...${NC}"
        echo "This will create maximum load to force HPA scaling"
        echo ""
        read -p "Duration in seconds (default 300): " duration
        duration=${duration:-300}
        
        read -p "Concurrency (default 50): " concurrency
        concurrency=${concurrency:-50}
        
        echo "Running extreme load for ${duration}s with $concurrency workers"
        echo ""
        ./test-extreme-load.sh "$BASE_URL" "$duration" "$concurrency"
        ;;
    4)
        echo -e "${BLUE}📊 Starting HPA Monitoring...${NC}"
        echo "Press Ctrl+C to stop"
        echo ""
        ./monitor-hpa.sh 5
        ;;
    5)
        echo -e "${GREEN}🎯 Custom Load Test${NC}"
        echo ""
        read -p "Base URL (default $BASE_URL): " custom_url
        custom_url=${custom_url:-$BASE_URL}
        
        read -p "Job type (bcrypt/prime/sort, default bcrypt): " custom_job_type
        custom_job_type=${custom_job_type:-bcrypt}
        
        read -p "Total jobs: " custom_total
        read -p "Concurrency: " custom_concurrency
        
        echo "Running custom test: $custom_total jobs, $custom_concurrency concurrent, $custom_job_type"
        echo ""
        node test-parallel-jobs.js "$custom_url" "$custom_total" "$custom_concurrency" "$custom_job_type"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Test completed!${NC}"
echo ""
echo -e "${BLUE}📊 Next steps:${NC}"
echo "1. Check Grafana dashboard for HPA metrics"
echo "2. Monitor pod scaling: kubectl get pods -l app=worker -w"
echo "3. Check HPA status: kubectl get hpa worker-hpa"
echo ""
echo -e "${BLUE}🔍 Useful commands:${NC}"
echo "   kubectl get hpa worker-hpa"
echo "   kubectl get pods -l app=worker"
echo "   curl $BASE_URL/health"
echo "   curl $BASE_URL/api/stats"
