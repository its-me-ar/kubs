#!/usr/bin/env python3

import requests
import time
import random
import sys
import json
from datetime import datetime

# Configuration
BASE_URL = sys.argv[1] if len(sys.argv) > 1 else 'http://kubs.local:50036'
JOB_TYPE = sys.argv[2] if len(sys.argv) > 2 else 'bcrypt'
TOTAL_JOBS = 100

# Colors for console output
class Colors:
    GREEN = '\033[32m'
    RED = '\033[31m'
    YELLOW = '\033[33m'
    BLUE = '\033[34m'
    RESET = '\033[0m'

def generate_job_payload(job_type, index):
    """Generate job payload based on type"""
    if job_type == 'prime':
        return {
            'type': 'prime',
            'payload': {
                'number': random.randint(1000, 50000),
                'complexity': random.randint(1, 10)
            }
        }
    elif job_type == 'bcrypt':
        return {
            'type': 'bcrypt',
            'payload': {
                'password': f'testpass{index}',
                'rounds': random.randint(8, 12)
            }
        }
    elif job_type == 'sort':
        algorithms = ['bubble', 'quick', 'merge']
        return {
            'type': 'sort',
            'payload': {
                'array': random.randint(100, 1000),
                'algorithm': random.choice(algorithms)
            }
        }
    else:
        raise ValueError(f'Invalid job type: {job_type}')

def submit_job(job_data, index):
    """Submit a single job"""
    try:
        start_time = time.time()
        response = requests.post(
            f'{BASE_URL}/api/jobs',
            json=job_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        end_time = time.time()
        response_time = int((end_time - start_time) * 1000)
        
        if response.status_code == 201:
            job_id = response.json().get('jobId', 'Unknown')
            print(f'{Colors.GREEN}✓{Colors.RESET} Job {index}: {job_id} ({response_time}ms)')
            return True, job_id
        else:
            print(f'{Colors.RED}✗{Colors.RESET} Job {index}: Failed (HTTP {response.status_code}, {response_time}ms)')
            print(f'   Response: {response.text}')
            return False, None
    except Exception as e:
        print(f'{Colors.RED}✗{Colors.RESET} Job {index}: Error - {str(e)}')
        return False, None

def main():
    print(f'🚀 Submitting {TOTAL_JOBS} jobs to: {BASE_URL}')
    print(f'📝 Job type: {JOB_TYPE}')
    print('')
    
    success_count = 0
    failed_count = 0
    job_ids = []
    
    start_time = time.time()
    
    print(f'🔍 Testing {JOB_TYPE} jobs...')
    print('')
    
    # Submit all jobs
    for i in range(1, TOTAL_JOBS + 1):
        try:
            job_data = generate_job_payload(JOB_TYPE, i)
            success, job_id = submit_job(job_data, i)
            
            if success:
                success_count += 1
                job_ids.append(job_id)
            else:
                failed_count += 1
            
            # Small delay to avoid overwhelming the service
            time.sleep(0.1)
            
        except Exception as e:
            failed_count += 1
            print(f'{Colors.RED}✗{Colors.RESET} Job {i}: Error - {str(e)}')
    
    end_time = time.time()
    total_time = end_time - start_time
    
    print('')
    print('📊 Results:')
    print('===========')
    print(f'Total Jobs: {Colors.BLUE}{TOTAL_JOBS}{Colors.RESET}')
    print(f'Successful: {Colors.GREEN}{success_count}{Colors.RESET}')
    print(f'Failed: {Colors.RED}{failed_count}{Colors.RESET}')
    print(f'Success Rate: {Colors.GREEN}{round(success_count * 100 / TOTAL_JOBS)}%{Colors.RESET}')
    print(f'Total Time: {Colors.YELLOW}{total_time:.2f}s{Colors.RESET}')
    print(f'Average Time per Job: {Colors.YELLOW}{int(total_time * 1000 / TOTAL_JOBS)}ms{Colors.RESET}')
    
    if success_count == TOTAL_JOBS:
        print(f'\n{Colors.GREEN}🎉 All {TOTAL_JOBS} jobs submitted successfully!{Colors.RESET}')
    else:
        print(f'\n{Colors.YELLOW}⚠️  Some jobs failed. Check the service logs.{Colors.RESET}')
    
    print('')
    print('🔍 Check job status with:')
    if job_ids:
        print(f'   curl {BASE_URL}/api/jobs/{job_ids[0]}')
    print('📊 Monitor with Grafana dashboard')

if __name__ == '__main__':
    main()
