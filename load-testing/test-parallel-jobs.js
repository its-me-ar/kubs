#!/usr/bin/env node

// Parallel Load Testing Script for Kubs
// This script submits jobs in parallel to trigger HPA and create more pods
// Usage: node test-parallel-jobs.js [BASE_URL] [TOTAL_JOBS] [CONCURRENCY] [JOB_TYPE]

const http = require('http');
const https = require('https');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const BASE_URL = process.argv[2] || 'http://kubs.local:50036';
const TOTAL_JOBS = parseInt(process.argv[3]) || 200;
const CONCURRENCY = parseInt(process.argv[4]) || 20;
const JOB_TYPE = process.argv[5] || 'bcrypt';

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
let completedJobs = 0;

console.log('🚀 Parallel Load Testing - Triggering HPA');
console.log('========================================');
console.log(`Target: ${BASE_URL}`);
console.log(`Total Jobs: ${TOTAL_JOBS}`);
console.log(`Concurrency: ${CONCURRENCY}`);
console.log(`Job Type: ${JOB_TYPE}`);
console.log('');

// Generate job payload based on type
function generateJobPayload(jobType, jobId) {
    switch (jobType) {
        case 'prime':
            return {
                type: 'prime',
                payload: {
                    number: Math.floor(Math.random() * 100000) + 10000,
                    complexity: Math.floor(Math.random() * 10) + 5
                }
            };
        case 'bcrypt':
            return {
                type: 'bcrypt',
                payload: {
                    password: `stresspass${jobId}`,
                    rounds: Math.floor(Math.random() * 5) + 10
                }
            };
        case 'sort':
            const algorithms = ['bubble', 'quick', 'merge'];
            return {
                type: 'sort',
                payload: {
                    array: Math.floor(Math.random() * 2000) + 1000,
                    algorithm: algorithms[Math.floor(Math.random() * algorithms.length)]
                }
            };
        default:
            throw new Error(`Invalid job type: ${jobType}`);
    }
}

// Submit a single job
function submitJob(jobData, jobId) {
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
                'User-Agent': 'Kubs-Parallel-Test/1.0'
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
                    console.log(`${colors.green}✓${colors.reset} Job ${jobId}: Submitted (${responseTime}ms)`);
                } else {
                    failedCount++;
                    console.log(`${colors.red}✗${colors.reset} Job ${jobId}: Failed (HTTP ${res.statusCode}, ${responseTime}ms)`);
                }
                
                completedJobs++;
                resolve();
            });
        });

        req.on('error', (err) => {
            failedCount++;
            completedJobs++;
            console.log(`${colors.red}✗${colors.reset} Job ${jobId}: Error - ${err.message}`);
            resolve();
        });

        req.write(JSON.stringify(jobData));
        req.end();
    });
}

// Monitor HPA and pods
async function monitorHPA() {
    try {
        console.log(`${colors.blue}📊 Monitoring HPA and Pods...${colors.reset}`);
        console.log('');

        // Check current pod count
        const { stdout: podCount } = await execAsync('kubectl get pods -l app=worker --no-headers 2>/dev/null | wc -l');
        console.log(`Current Worker Pods: ${colors.yellow}${podCount.trim()}${colors.reset}`);

        // Check HPA status
        console.log(`${colors.blue}HPA Status:${colors.reset}`);
        try {
            const { stdout: hpaStatus } = await execAsync('kubectl get hpa worker-hpa 2>/dev/null');
            console.log(hpaStatus);
        } catch (error) {
            console.log('HPA not found or not accessible');
        }

        console.log('');
        console.log(`${colors.blue}Queue Length:${colors.reset}`);
        
        // Check queue length
        try {
            const queueResponse = await new Promise((resolve) => {
                const url = new URL('/api/stats', BASE_URL);
                const options = {
                    hostname: url.hostname,
                    port: url.port || (url.protocol === 'https:' ? 443 : 80),
                    path: url.pathname,
                    method: 'GET'
                };
                
                const client = url.protocol === 'https:' ? https : http;
                const req = client.request(options, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => resolve(data));
                });
                
                req.on('error', () => resolve('Stats not available'));
                req.end();
            });
            
            const queueMatch = queueResponse.match(/"queue_length":(\d+)/);
            if (queueMatch) {
                console.log(`Queue Length: ${colors.yellow}${queueMatch[1]}${colors.reset}`);
            } else {
                console.log('Queue length not available');
            }
        } catch (error) {
            console.log('Stats not available');
        }

        console.log('');
    } catch (error) {
        console.log('Monitoring failed:', error.message);
    }
}

// Run parallel jobs
async function runParallelJobs() {
    const jobsPerWorker = Math.floor(TOTAL_JOBS / CONCURRENCY);
    const remainingJobs = TOTAL_JOBS % CONCURRENCY;
    
    console.log(`${colors.yellow}🔄 Starting ${CONCURRENCY} parallel workers...${colors.reset}`);
    console.log(`${colors.yellow}📊 Jobs per worker: ${jobsPerWorker}${colors.reset}`);
    console.log('');

    const workers = [];
    
    for (let worker = 1; worker <= CONCURRENCY; worker++) {
        const workerJobs = worker <= remainingJobs ? jobsPerWorker + 1 : jobsPerWorker;
        
        const workerPromise = (async () => {
            for (let job = 1; job <= workerJobs; job++) {
                const globalJobId = (worker - 1) * jobsPerWorker + job;
                const jobData = generateJobPayload(JOB_TYPE, globalJobId);
                await submitJob(jobData, globalJobId);
                
                // Small random delay to spread load
                await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
            }
        })();
        
        workers.push(workerPromise);
    }
    
    // Wait for all workers to complete
    await Promise.all(workers);
}

// Main function
async function main() {
    console.log(`${colors.yellow}🔍 Pre-test system status:${colors.reset}`);
    await monitorHPA();

    console.log(`${colors.yellow}🚀 Starting parallel load test...${colors.reset}`);
    const startTime = Date.now();

    // Run parallel jobs
    await runParallelJobs();

    const endTime = Date.now();
    const totalTime = Math.floor((endTime - startTime) / 1000);

    console.log('');
    console.log(`${colors.yellow}🔍 Post-test system status:${colors.reset}`);
    await monitorHPA();

    console.log('');
    console.log('📊 Load Test Results:');
    console.log('====================');
    console.log(`Total Jobs: ${colors.blue}${TOTAL_JOBS}${colors.reset}`);
    console.log(`Successful: ${colors.green}${successCount}${colors.reset}`);
    console.log(`Failed: ${colors.red}${failedCount}${colors.reset}`);
    console.log(`Success Rate: ${colors.green}${Math.round(successCount * 100 / TOTAL_JOBS)}%${colors.reset}`);
    console.log(`Total Time: ${colors.yellow}${totalTime}s${colors.reset}`);
    console.log(`Jobs per Second: ${colors.yellow}${Math.round(TOTAL_JOBS / totalTime)}${colors.reset}`);

    if (successCount === TOTAL_JOBS) {
        console.log(`\n${colors.green}🎉 All ${TOTAL_JOBS} jobs submitted successfully!${colors.reset}`);
    } else {
        console.log(`\n${colors.yellow}⚠️  Some jobs failed. Check the service logs.${colors.reset}`);
    }

    console.log('');
    console.log(`${colors.blue}🔍 Monitor HPA scaling:${colors.reset}`);
    console.log('   kubectl get hpa worker-hpa -w');
    console.log('   kubectl get pods -l app=worker -w');
    console.log('');
    console.log(`${colors.blue}📊 Check queue status:${colors.reset}`);
    console.log(`   curl ${BASE_URL}/api/stats`);
}

// Run the test
main().catch(console.error);
