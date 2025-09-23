# 🚀 Quick Reference - Kubs Load Testing

## ⚡ **Fast Commands**

### **Basic Load Test**
```bash
# 100 jobs sequentially
node test-100-jobs.js http://kubs.local:50036 bcrypt
```

### **Parallel Load Test (HPA Triggering)**
```bash
# Moderate load
node test-parallel-jobs.js http://kubs.local:50036 100 20 bcrypt

# Heavy load
node test-parallel-jobs.js http://kubs.local:50036 500 50 bcrypt
```

### **Monitor HPA**
```bash
# Real-time monitoring
./monitor-hpa.sh 5
```

## 📊 **Grafana HPA Panels**

- **📈 HPA Replica Scaling** - Current/Min/Max replicas
- **🎯 HPA CPU Utilization** - CPU usage vs target
- **🐳 Worker Pod Count** - Live pod count

## 🎯 **Job Types**

- `bcrypt` - CPU intensive (recommended for HPA testing)
- `prime` - CPU intensive
- `sort` - Memory intensive

## 🔍 **Quick Checks**

```bash
# Check HPA status
kubectl get hpa worker-hpa

# Check pods
kubectl get pods -l app=worker

# Check service health
curl http://kubs.local:50036/health
```

## 📈 **Expected HPA Behavior**

- **Min Pods**: 2
- **Max Pods**: 10  
- **Target CPU**: 70%
- **Scale Up**: CPU > 70% for 3 minutes
- **Scale Down**: CPU < 70% for 5 minutes

## 🚨 **Troubleshooting**

- **No HPA data**: Check `kube-state-metrics` is running
- **High errors**: Reduce concurrency
- **No scaling**: Check HPA configuration

---

**Ready to test!** 🎯
