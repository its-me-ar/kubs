# 🚀 Kubs Load Testing Suite

Comprehensive load testing tools for the Kubs microservices platform with HPA (Horizontal Pod Autoscaler) monitoring and Grafana integration.

## 📁 **Folder Structure**

```
load-testing/
├── README.md                    # This file
├── test-100-jobs.sh            # Simple sequential load test (Bash)
├── test-100-jobs.js            # Simple sequential load test (Node.js)
├── test-100-jobs.py            # Simple sequential load test (Python)
├── test-parallel-jobs.sh       # Parallel load test (Bash)
├── test-parallel-jobs.js       # Parallel load test (Node.js) ⭐ RECOMMENDED
├── test-extreme-load.sh        # Extreme load test for HPA triggering
└── monitor-hpa.sh              # Real-time HPA monitoring script
```

## 🎯 **Quick Start**

### **1. Basic Load Test (100 jobs sequentially)**
```bash
# Bash version
./test-100-jobs.sh http://kubs.local:50036 bcrypt

# Node.js version (recommended)
node test-100-jobs.js http://kubs.local:50036 bcrypt

# Python version
python3 test-100-jobs.py http://kubs.local:50036 bcrypt
```

### **2. Parallel Load Test (HPA Triggering)**
```bash
# Moderate load (50 jobs, 10 concurrent)
node test-parallel-jobs.js http://kubs.local:50036 50 10 bcrypt

# Heavy load (200 jobs, 30 concurrent)
node test-parallel-jobs.js http://kubs.local:50036 200 30 bcrypt

# Extreme load (500 jobs, 50 concurrent)
node test-parallel-jobs.js http://kubs.local:50036 500 50 bcrypt
```

### **3. Monitor HPA Scaling**
```bash
# Real-time monitoring
./monitor-hpa.sh 5  # Refresh every 5 seconds
```

## 📊 **Grafana Dashboard Integration**

The Grafana dashboard now includes **HPA monitoring panels**:

### **New HPA Panels Added:**
- **📈 HPA Replica Scaling** - Shows current, min, and max replicas
- **🎯 HPA CPU Utilization** - Shows CPU usage vs target threshold
- **🐳 Worker Pod Count** - Real-time pod count tracking

### **HPA Metrics Monitored:**
- `kube_horizontalpodautoscaler_status_current_replicas`
- `kube_horizontalpodautoscaler_spec_min_replicas`
- `kube_horizontalpodautoscaler_spec_max_replicas`
- `kube_horizontalpodautoscaler_status_current_cpu_utilization_percentage`
- `kube_horizontalpodautoscaler_spec_target_cpu_utilization_percentage`

## 🛠️ **Scripts Overview**

### **Sequential Load Tests**

#### **test-100-jobs.sh** (Bash)
- **Purpose**: Submit 100 jobs sequentially
- **Features**: Real-time progress, statistics, color output
- **Usage**: `./test-100-jobs.sh [URL] [JOB_TYPE]`

#### **test-100-jobs.js** (Node.js) ⭐
- **Purpose**: Submit 100 jobs sequentially with better error handling
- **Features**: Response time tracking, detailed statistics
- **Usage**: `node test-100-jobs.js [URL] [JOB_TYPE]`

#### **test-100-jobs.py** (Python)
- **Purpose**: Clean Python implementation
- **Features**: Clean output, good error handling
- **Usage**: `python3 test-100-jobs.py [URL] [JOB_TYPE]`

### **Parallel Load Tests**

#### **test-parallel-jobs.js** (Node.js) ⭐ RECOMMENDED
- **Purpose**: Submit jobs in parallel to trigger HPA
- **Features**: 
  - Configurable concurrency and total jobs
  - Real-time HPA monitoring
  - Comprehensive statistics
  - Better error handling
- **Usage**: `node test-parallel-jobs.js [URL] [TOTAL_JOBS] [CONCURRENCY] [JOB_TYPE]`

#### **test-parallel-jobs.sh** (Bash)
- **Purpose**: Parallel load testing with bash
- **Features**: Basic parallel execution
- **Usage**: `./test-parallel-jobs.sh [URL] [TOTAL_JOBS] [CONCURRENCY] [JOB_TYPE]`

#### **test-extreme-load.sh** (Bash)
- **Purpose**: Maximum load to force HPA scaling
- **Features**: 
  - 50+ concurrent workers
  - Heavy BCrypt jobs (12-14 rounds)
  - Real-time system monitoring
- **Usage**: `./test-extreme-load.sh [URL] [DURATION_SECONDS] [CONCURRENCY]`

### **Monitoring Scripts**

#### **monitor-hpa.sh** (Bash)
- **Purpose**: Real-time HPA and pod monitoring
- **Features**: 
  - Live HPA status
  - Pod count tracking
  - CPU usage monitoring
  - Queue length checking
- **Usage**: `./monitor-hpa.sh [REFRESH_INTERVAL]`

## 🎯 **Job Types Supported**

### **Prime Jobs** (CPU Intensive)
```json
{
  "type": "prime",
  "payload": {
    "number": 15000,
    "complexity": 5
  }
}
```

### **BCrypt Jobs** (CPU Intensive)
```json
{
  "type": "bcrypt",
  "payload": {
    "password": "testpass123",
    "rounds": 10
  }
}
```

### **Sort Jobs** (Memory Intensive)
```json
{
  "type": "sort",
  "payload": {
    "array": 500,
    "algorithm": "quick"
  }
}
```

## 📈 **Load Testing Scenarios**

### **Development Testing**
```bash
# Light load
node test-parallel-jobs.js http://kubs.local:50036 50 5 bcrypt
```

### **Staging Testing**
```bash
# Medium load
node test-parallel-jobs.js http://kubs.local:50036 200 20 bcrypt
```

### **Production-like Testing**
```bash
# Heavy load
node test-parallel-jobs.js http://kubs.local:50036 500 50 bcrypt
```

### **HPA Stress Testing**
```bash
# Extreme load to trigger scaling
./test-extreme-load.sh http://kubs.local:50036 300 100
```

## 🔍 **Monitoring During Tests**

### **Real-time Monitoring**
```bash
# Terminal 1: Run load test
node test-parallel-jobs.js http://kubs.local:50036 500 50 bcrypt

# Terminal 2: Monitor HPA
./monitor-hpa.sh 3

# Terminal 3: Watch pods
kubectl get pods -l app=worker -w
```

### **Grafana Dashboard**
- Open Grafana dashboard
- Watch HPA panels in real-time
- Monitor CPU usage and pod scaling

## 📊 **Expected Results**

### **HPA Scaling Behavior**
- **Min Pods**: 2
- **Max Pods**: 10
- **Target CPU**: 70%
- **Scale Up**: When CPU > 70% for 3 minutes
- **Scale Down**: When CPU < 70% for 5 minutes

### **Performance Thresholds**
- **Response Time P95**: < 2 seconds
- **Error Rate**: < 5%
- **Queue Length**: < 100 jobs
- **CPU Usage**: 50-80% (triggers scaling)

## 🚨 **Troubleshooting**

### **Common Issues**

#### **"No data" in Grafana HPA panels**
- Check if `kube-state-metrics` is running
- Verify HPA exists: `kubectl get hpa`
- Check Prometheus targets

#### **High Error Rate**
- Reduce concurrency
- Check service logs
- Verify resource limits

#### **HPA Not Scaling**
- Check HPA status: `kubectl describe hpa worker-hpa`
- Verify CPU metrics are available
- Check HPA configuration

### **Debug Commands**
```bash
# Check HPA status
kubectl get hpa worker-hpa
kubectl describe hpa worker-hpa

# Check pods
kubectl get pods -l app=worker
kubectl top pods -l app=worker

# Check service health
curl http://kubs.local:50036/health
curl http://kubs.local:50036/api/stats

# Check Prometheus metrics
kubectl port-forward svc/prometheus-server 9090:80
# Open http://localhost:9090
```

## 🎯 **Best Practices**

### **Load Testing Strategy**
1. **Start Small**: Begin with low concurrency
2. **Gradual Increase**: Slowly increase load
3. **Monitor Resources**: Watch CPU, memory, pods
4. **Test Different Scenarios**: Mix job types
5. **Document Results**: Keep performance baselines

### **HPA Testing**
1. **Baseline Test**: Establish normal load
2. **Scale Up Test**: Increase load to trigger scaling
3. **Scale Down Test**: Reduce load to trigger scale down
4. **Sustained Load Test**: Test under constant high load
5. **Peak Load Test**: Test maximum capacity

## 📝 **Example Test Runs**

### **Complete HPA Test Sequence**
```bash
# 1. Baseline test
node test-parallel-jobs.js http://kubs.local:50036 100 10 bcrypt

# 2. Scale up test
node test-parallel-jobs.js http://kubs.local:50036 500 50 bcrypt

# 3. Monitor scaling
./monitor-hpa.sh 5

# 4. Extreme test
./test-extreme-load.sh http://kubs.local:50036 600 100

# 5. Scale down test (wait for load to decrease)
# Watch pods scale down automatically
```

## 🔧 **Configuration**

### **Environment Variables**
```bash
export KUBS_URL="http://kubs.local:50036"
export JOB_TYPE="bcrypt"
export CONCURRENCY=20
export TOTAL_JOBS=200
```

### **Custom Job Payloads**
Modify the `generateJobPayload` function in the scripts to create custom job types or payloads.

## 📊 **Performance Metrics**

### **Key Metrics to Track**
- **Throughput**: Jobs per second
- **Response Time**: P50, P95, P99 percentiles
- **Error Rate**: Failed requests percentage
- **Resource Usage**: CPU, memory, network
- **HPA Scaling**: Pod count changes
- **Queue Length**: Job backlog

### **Grafana Queries**
```promql
# HPA Current Replicas
kube_horizontalpodautoscaler_status_current_replicas{horizontalpodautoscaler="worker-hpa"}

# HPA CPU Utilization
kube_horizontalpodautoscaler_status_current_cpu_utilization_percentage{horizontalpodautoscaler="worker-hpa"}

# Worker Pod Count
count(kube_pod_info{pod=~"worker-deployment-.*"})

# Job Processing Rate
rate(jobs_processed_total{job="worker-service"}[5m])
```

## 🎉 **Success Criteria**

### **HPA Working Correctly**
- ✅ Pods scale up when CPU > 70%
- ✅ Pods scale down when CPU < 70%
- ✅ Scaling happens within 3-5 minutes
- ✅ No pod crashes or errors

### **Performance Acceptable**
- ✅ Response time P95 < 2 seconds
- ✅ Error rate < 5%
- ✅ System remains stable under load
- ✅ Queue doesn't grow indefinitely

---

## 🚀 **Ready to Test!**

Choose your testing approach and start load testing your Kubs microservices with HPA monitoring! The Grafana dashboard will show you real-time scaling behavior and performance metrics.

**Happy Load Testing!** 🎯
