#!/bin/bash

# Simple script to submit 100 jobs to the kubs submitter service
# Usage: ./test-100-jobs.sh [BASE_URL] [JOB_TYPE]

BASE_URL=${1:-"http://kubs.local:50036"}
JOB_TYPE=${2:-"bcrypt"}

echo "🚀 Submitting 100 jobs to: $BASE_URL"
echo "📝 Job type: $JOB_TYPE"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
SUCCESS_COUNT=0
FAILED_COUNT=0
TOTAL_TIME=0

# Job types and their payloads
case $JOB_TYPE in
    "prime")
        echo "🔢 Testing Prime Number jobs"
        ;;
    "bcrypt")
        echo "🔐 Testing BCrypt jobs"
        ;;
    "sort")
        echo "📊 Testing Sort jobs"
        ;;
    *)
        echo "❌ Invalid job type. Use: prime, bcrypt, or sort"
        exit 1
        ;;
esac

echo ""

# Start timing
START_TIME=$(date +%s)

# Submit 100 jobs
for i in {1..100}; do
    # Generate different payloads for variety
    case $JOB_TYPE in
        "prime")
            NUMBER=$((RANDOM % 50000 + 1000))
            COMPLEXITY=$((RANDOM % 10 + 1))
            PAYLOAD="{\"type\":\"prime\",\"payload\":{\"number\":$NUMBER,\"complexity\":$COMPLEXITY}}"
            ;;
        "bcrypt")
            ROUNDS=$((RANDOM % 5 + 8))
            PASSWORD="testpass$i"
            PAYLOAD="{\"type\":\"bcrypt\",\"payload\":{\"password\":\"$PASSWORD\",\"rounds\":$ROUNDS}}"
            ;;
        "sort")
            ARRAY_SIZE=$((RANDOM % 1000 + 100))
            ALGORITHM=$(["bubble", "quick", "merge"][RANDOM % 3])
            PAYLOAD="{\"type\":\"sort\",\"payload\":{\"array\":$ARRAY_SIZE,\"algorithm\":\"$ALGORITHM\"}}"
            ;;
    esac
    
    # Submit job
    RESPONSE=$(curl -s -w "\n%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD" \
        "$BASE_URL/api/jobs" 2>/dev/null)
    
    # Parse response
    HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
    RESPONSE_BODY=$(echo "$RESPONSE" | sed '$d')
    
    if [ "$HTTP_CODE" = "201" ]; then
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        JOB_ID=$(echo "$RESPONSE_BODY" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
        echo -e "${GREEN}✓${NC} Job $i: $JOB_ID"
    else
        FAILED_COUNT=$((FAILED_COUNT + 1))
        echo -e "${RED}✗${NC} Job $i: Failed (HTTP $HTTP_CODE)"
        echo "   Response: $RESPONSE_BODY"
    fi
    
    # Small delay to avoid overwhelming the service
    sleep 0.1
done

# Calculate timing
END_TIME=$(date +%s)
TOTAL_TIME=$((END_TIME - START_TIME))

echo ""
echo "📊 Results:"
echo "==========="
echo -e "Total Jobs: ${BLUE}100${NC}"
echo -e "Successful: ${GREEN}$SUCCESS_COUNT${NC}"
echo -e "Failed: ${RED}$FAILED_COUNT${NC}"
echo -e "Success Rate: ${GREEN}$((SUCCESS_COUNT * 100 / 100))%${NC}"
echo -e "Total Time: ${YELLOW}${TOTAL_TIME}s${NC}"
echo -e "Average Time per Job: ${YELLOW}$((TOTAL_TIME * 1000 / 100))ms${NC}"

if [ $SUCCESS_COUNT -eq 100 ]; then
    echo -e "\n${GREEN}🎉 All 100 jobs submitted successfully!${NC}"
else
    echo -e "\n${YELLOW}⚠️  Some jobs failed. Check the service logs.${NC}"
fi

echo ""
echo "🔍 Check job status with:"
echo "   curl $BASE_URL/api/jobs/{JOB_ID}"
echo ""
echo "📊 Monitor with Grafana dashboard"
