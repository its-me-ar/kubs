#!/usr/bin/env node

// Simple Node.js script to submit 100 jobs to the kubs submitter service
// Usage: node test-100-jobs.js [BASE_URL] [JOB_TYPE]

const http = require('http');
const https = require('https');

// Configuration
const BASE_URL = process.argv[2] || 'http://kubs.local:50036';
const JOB_TYPE = process.argv[3] || 'bcrypt';
const TOTAL_JOBS = 100;

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

// Counters
let successCount = 0;
let failedCount = 0;
let jobIds = [];

console.log(`🚀 Submitting ${TOTAL_JOBS} jobs to: ${BASE_URL}`);
console.log(`📝 Job type: ${JOB_TYPE}`);
console.log('');

// Generate job payload based on type
function generateJobPayload(jobType, index) {
    switch (jobType) {
        case 'prime':
            return {
                type: 'prime',
                payload: {
                    number: Math.floor(Math.random() * 50000) + 1000,
                    complexity: Math.floor(Math.random() * 10) + 1
                }
            };
        case 'bcrypt':
            return {
                type: 'bcrypt',
                payload: {
                    password: `testpass${index}`,
                    rounds: Math.floor(Math.random() * 5) + 8
                }
            };
        case 'sort':
            const algorithms = ['bubble', 'quick', 'merge'];
            return {
                type: 'sort',
                payload: {
                    array: Math.floor(Math.random() * 1000) + 100,
                    algorithm: algorithms[Math.floor(Math.random() * algorithms.length)]
                }
            };
        default:
            throw new Error(`Invalid job type: ${jobType}`);
    }
}

// Submit a single job
function submitJob(jobData, index) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        const url = new URL('/api/jobs', BASE_URL);
        
        const options = {
            hostname: url.hostname,
            port: url.port || (url.protocol === 'https:' ? 443 : 80),
            path: url.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Kubs-Test-Script/1.0'
            }
        };

        const client = url.protocol === 'https:' ? https : http;
        const req = client.request(options, (res) => {
            let responseData = '';
            res.on('data', chunk => responseData += chunk);
            res.on('end', () => {
                const endTime = Date.now();
                const responseTime = endTime - startTime;
                
                if (res.statusCode === 201) {
                    successCount++;
                    const jobId = JSON.parse(responseData).jobId;
                    jobIds.push(jobId);
                    console.log(`${colors.green}✓${colors.reset} Job ${index}: ${jobId} (${responseTime}ms)`);
                } else {
                    failedCount++;
                    console.log(`${colors.red}✗${colors.reset} Job ${index}: Failed (HTTP ${res.statusCode}, ${responseTime}ms)`);
                    console.log(`   Response: ${responseData}`);
                }
                resolve();
            });
        });

        req.on('error', (err) => {
            failedCount++;
            console.log(`${colors.red}✗${colors.reset} Job ${index}: Error - ${err.message}`);
            resolve();
        });

        req.write(JSON.stringify(jobData));
        req.end();
    });
}

// Main function
async function runTest() {
    const startTime = Date.now();
    
    console.log(`🔍 Testing ${JOB_TYPE} jobs...`);
    console.log('');
    
    // Submit all jobs
    for (let i = 1; i <= TOTAL_JOBS; i++) {
        try {
            const jobData = generateJobPayload(JOB_TYPE, i);
            await submitJob(jobData, i);
            
            // Small delay to avoid overwhelming the service
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            failedCount++;
            console.log(`${colors.red}✗${colors.reset} Job ${i}: Error - ${error.message}`);
        }
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('');
    console.log('📊 Results:');
    console.log('===========');
    console.log(`Total Jobs: ${colors.blue}${TOTAL_JOBS}${colors.reset}`);
    console.log(`Successful: ${colors.green}${successCount}${colors.reset}`);
    console.log(`Failed: ${colors.red}${failedCount}${colors.reset}`);
    console.log(`Success Rate: ${colors.green}${Math.round(successCount * 100 / TOTAL_JOBS)}%${colors.reset}`);
    console.log(`Total Time: ${colors.yellow}${(totalTime / 1000).toFixed(2)}s${colors.reset}`);
    console.log(`Average Time per Job: ${colors.yellow}${Math.round(totalTime / TOTAL_JOBS)}ms${colors.reset}`);
    
    if (successCount === TOTAL_JOBS) {
        console.log(`\n${colors.green}🎉 All ${TOTAL_JOBS} jobs submitted successfully!${colors.reset}`);
    } else {
        console.log(`\n${colors.yellow}⚠️  Some jobs failed. Check the service logs.${colors.reset}`);
    }
    
    console.log('');
    console.log('🔍 Check job status with:');
    if (jobIds.length > 0) {
        console.log(`   curl ${BASE_URL}/api/jobs/${jobIds[0]}`);
    }
    console.log('📊 Monitor with Grafana dashboard');
}

// Run the test
runTest().catch(console.error);
