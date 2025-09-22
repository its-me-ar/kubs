# 📊 Prometheus Queries Reference

This document contains useful Prometheus queries for monitoring your kubs microservices.

## 🔍 **Access Prometheus**
```bash
# Start monitoring access
./scripts/access-monitoring.sh

# Then open: http://localhost:9090
```

---

## ⚙️ **Worker Service Metrics**

### **Job Processing Metrics**
```promql
# Total jobs processed
jobs_processed_total

# Jobs processed rate (per minute)
rate(jobs_processed_total[5m]) * 60

# Job errors
job_errors_total

# Job error rate (per minute)
rate(job_errors_total[5m]) * 60

# Job processing time histogram
job_processing_time_seconds

# Average processing time
rate(job_processing_time_seconds_sum[5m]) / rate(job_processing_time_seconds_count[5m])

# 95th percentile processing time
histogram_quantile(0.95, rate(job_processing_time_seconds_bucket[5m]))
```

### **Worker Health & Performance**
```promql
# Worker service health
up{job="worker-service"}

# CPU usage
rate(process_cpu_seconds_total{job="worker-service"}[5m])

# Memory usage
process_resident_memory_bytes{job="worker-service"}

# Event loop lag
nodejs_eventloop_lag_seconds{job="worker-service"}
```

---

## 📊 **Stats Service Metrics**

### **Job Statistics**
```promql
# Total jobs submitted
total_jobs_submitted

# Total jobs completed
total_jobs_completed

# Total jobs failed
total_jobs_failed

# Current queue length
queue_length

# Average processing time
average_processing_time_seconds

# Jobs submitted rate (per minute)
rate(total_jobs_submitted[5m]) * 60

# Jobs completed rate (per minute)
rate(total_jobs_completed[5m]) * 60

# Jobs failed rate (per minute)
rate(total_jobs_failed[5m]) * 60
```

### **Success Rate & Error Rate**
```promql
# Job success rate (%)
total_jobs_completed / (total_jobs_completed + total_jobs_failed) * 100

# Job failure rate (%)
total_jobs_failed / (total_jobs_completed + total_jobs_failed) * 100

# Error rate over time
rate(total_jobs_failed[5m]) / rate(total_jobs_submitted[5m]) * 100
```

---

## 🔄 **Combined System Metrics**

### **Overall System Health**
```promql
# All kubs services health
up{job=~".*service"}

# Worker services health
up{job="worker-service"}

# Stats service health
up{job="stats-service"}

# Submitter service health (if exposed)
up{job="submitter-service"}
```

### **System Performance**
```promql
# Total jobs in system
total_jobs_submitted

# Jobs currently processing
total_jobs_submitted - total_jobs_completed - total_jobs_failed

# System throughput (jobs/minute)
rate(total_jobs_completed[5m]) * 60

# Average queue wait time
queue_length / rate(total_jobs_completed[5m])
```

---

## 📈 **Grafana Dashboard Queries**

### **Key Performance Indicators**
```promql
# Jobs per minute
sum(rate(total_jobs_completed[1m])) * 60

# Error rate percentage
sum(rate(total_jobs_failed[5m])) / sum(rate(total_jobs_submitted[5m])) * 100

# Average processing time
avg(average_processing_time_seconds)

# Queue length
avg(queue_length)

# Worker utilization
sum(rate(jobs_processed_total[5m])) / count(up{job="worker-service"})
```

### **Time Series Queries**
```promql
# Jobs completed over time
sum(rate(total_jobs_completed[1m])) by (instance)

# Processing time over time
avg(average_processing_time_seconds) by (instance)

# Queue length over time
avg(queue_length) by (instance)

# Error rate over time
sum(rate(total_jobs_failed[5m])) / sum(rate(total_jobs_submitted[5m])) by (instance)
```

---

## 🚨 **Alerting Queries**

### **High Error Rate Alert**
```promql
# Alert if error rate > 5%
sum(rate(total_jobs_failed[5m])) / sum(rate(total_jobs_submitted[5m])) > 0.05
```

### **High Queue Length Alert**
```promql
# Alert if queue length > 100
queue_length > 100
```

### **Service Down Alert**
```promql
# Alert if any service is down
up{job=~".*service"} == 0
```

### **High Processing Time Alert**
```promql
# Alert if average processing time > 10 seconds
average_processing_time_seconds > 10
```

---

## 🔧 **Troubleshooting Queries**

### **Debug Job Processing**
```promql
# Jobs processed by worker instance
jobs_processed_total by (instance, pod)

# Job errors by worker instance
job_errors_total by (instance, pod)

# Processing time by worker instance
job_processing_time_seconds by (instance, pod)
```

### **Debug System Issues**
```promql
# All metrics from worker service
{job="worker-service"}

# All metrics from stats service
{job="stats-service"}

# Recent job activity
increase(total_jobs_completed[1h])
increase(total_jobs_failed[1h])
```

---

## 📋 **Quick Reference Commands**

### **Check All Targets**
```bash
# In Prometheus UI, go to Status > Targets
# Look for worker-service and stats-service targets
```

### **Test Queries**
```bash
# Test a query via API
curl "http://localhost:9090/api/v1/query?query=up{job=\"worker-service\"}"
```

### **Export Metrics**
```bash
# Get raw metrics from worker
curl http://localhost:3001/metrics

# Get raw metrics from stats
curl http://localhost:3002/metrics
```

---

## 💡 **Pro Tips**

1. **Use time ranges**: Add `[5m]`, `[1h]`, `[1d]` for different time windows
2. **Use rate() for counters**: Always use `rate()` for counter metrics
3. **Use sum() for aggregation**: Combine multiple instances
4. **Use by (label) for grouping**: Group by instance, pod, etc.
5. **Use histogram_quantile()**: For percentile calculations
6. **Test queries**: Use the Graph tab to visualize before creating alerts

---

## 🎯 **Common Use Cases**

### **Monitor System Health**
- Check `up{job=~".*service"}` for service availability
- Monitor `queue_length` for system load
- Watch `average_processing_time_seconds` for performance

### **Track Business Metrics**
- Monitor `total_jobs_completed` for throughput
- Track `total_jobs_failed` for error rates
- Watch `jobs_processed_total` for worker activity

### **Performance Tuning**
- Use `job_processing_time_seconds` histogram for latency analysis
- Monitor `process_cpu_seconds_total` for resource usage
- Track `nodejs_eventloop_lag_seconds` for Node.js performance

---

*Last updated: $(date)*
