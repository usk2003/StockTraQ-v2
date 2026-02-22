# IPO TraQ - Deployment Guide 🚀

Complete guide for deploying IPO TraQ across different platforms.

---

## Table of Contents
1. [Local Development](#local-development)
2. [Streamlit Cloud](#streamlit-cloud)
3. [Docker Deployment](#docker-deployment)
4. [Heroku](#heroku)
5. [AWS Deployment](#aws-deployment)
6. [Google Cloud Platform](#google-cloud-platform)

---

## Local Development

### Prerequisites
- Python 3.9 or higher
- pip package manager
- 500MB disk space

### Quick Start

```bash
# 1. Navigate to project directory
cd ipo_traq

# 2. Install dependencies
pip install -r requirements.txt

# 3. Train models (first time only)
python train_models.py

# 4. Run the app
streamlit run app.py
```

**Access:** http://localhost:8501

### Using the Launch Script

```bash
chmod +x run.sh
./run.sh
```

This script automatically:
- Checks for trained models
- Trains if necessary
- Installs dependencies
- Launches the app

---

## Streamlit Cloud

### Deploy to Streamlit Cloud (Recommended)

**Steps:**

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit - IPO TraQ"
git remote add origin https://github.com/yourusername/ipo-traq.git
git push -u origin main
```

2. **Create Streamlit Cloud Account**
- Visit: https://share.streamlit.io
- Sign in with GitHub

3. **Deploy App**
- Click "New app"
- Select your repository
- Set main file: `app.py`
- Click "Deploy"

4. **Configure Settings**
- Python version: 3.9
- Set secrets if needed
- Configure resources

**Benefits:**
- ✅ Free hosting
- ✅ Automatic HTTPS
- ✅ Auto-deployment on git push
- ✅ Easy sharing via URL

**Limitations:**
- Resource limits on free tier
- Public repositories only (free tier)

---

## Docker Deployment

### Create Dockerfile

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose Streamlit port
EXPOSE 8501

# Health check
HEALTHCHECK CMD curl --fail http://localhost:8501/_stcore/health

# Run app
ENTRYPOINT ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

### Build and Run

```bash
# Build image
docker build -t ipo-traq:latest .

# Run container
docker run -p 8501:8501 ipo-traq:latest
```

**Access:** http://localhost:8501

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  ipo-traq:
    build: .
    ports:
      - "8501:8501"
    volumes:
      - ./models:/app/models
    environment:
      - STREAMLIT_SERVER_PORT=8501
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

---

## Heroku

### Prerequisites
- Heroku account
- Heroku CLI installed

### Deployment Steps

1. **Create Required Files**

`Procfile`:
```
web: streamlit run app.py --server.port=$PORT --server.address=0.0.0.0
```

`setup.sh`:
```bash
mkdir -p ~/.streamlit/

echo "\
[server]\n\
headless = true\n\
port = $PORT\n\
enableCORS = false\n\
\n\
" > ~/.streamlit/config.toml
```

2. **Deploy**

```bash
# Login to Heroku
heroku login

# Create app
heroku create ipo-traq-app

# Set buildpack
heroku buildpacks:set heroku/python

# Deploy
git push heroku main
```

3. **Configure**

```bash
# Set environment variables
heroku config:set PYTHONUNBUFFERED=1

# Scale dynos
heroku ps:scale web=1

# View logs
heroku logs --tail
```

**Access:** https://ipo-traq-app.herokuapp.com

---

## AWS Deployment

### Option 1: AWS Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize**
```bash
eb init -p python-3.9 ipo-traq
```

3. **Create Environment**
```bash
eb create ipo-traq-env
```

4. **Deploy**
```bash
eb deploy
```

5. **Access**
```bash
eb open
```

### Option 2: AWS EC2

1. **Launch EC2 Instance**
- AMI: Ubuntu 22.04
- Instance type: t2.medium (recommended)
- Security group: Allow port 8501

2. **SSH into Instance**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

3. **Install Dependencies**
```bash
sudo apt update
sudo apt install python3-pip python3-venv -y
```

4. **Clone & Setup**
```bash
git clone https://github.com/yourusername/ipo-traq.git
cd ipo-traq
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python train_models.py
```

5. **Run with Screen**
```bash
screen -S ipo-traq
streamlit run app.py --server.port=8501 --server.address=0.0.0.0
# Detach: Ctrl+A, D
```

**Access:** http://your-ec2-ip:8501

### Option 3: AWS Lambda + API Gateway

For serverless deployment, convert to AWS Lambda function using Zappa or Mangum.

---

## Google Cloud Platform

### Option 1: Cloud Run

1. **Create Dockerfile** (see Docker section)

2. **Deploy**
```bash
# Build and push to GCR
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ipo-traq

# Deploy to Cloud Run
gcloud run deploy ipo-traq \
  --image gcr.io/YOUR_PROJECT_ID/ipo-traq \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Option 2: Compute Engine

Similar to AWS EC2:

1. **Create VM**
```bash
gcloud compute instances create ipo-traq-vm \
  --machine-type=e2-medium \
  --zone=us-central1-a
```

2. **SSH and Setup**
```bash
gcloud compute ssh ipo-traq-vm
# Follow same steps as EC2
```

### Option 3: App Engine

1. **Create `app.yaml`**
```yaml
runtime: python39

entrypoint: streamlit run app.py --server.port=$PORT --server.address=0.0.0.0

instance_class: F2

automatic_scaling:
  max_instances: 3
```

2. **Deploy**
```bash
gcloud app deploy
```

---

## Environment Variables

### Recommended Configuration

```bash
# Streamlit settings
STREAMLIT_SERVER_PORT=8501
STREAMLIT_SERVER_ADDRESS=0.0.0.0
STREAMLIT_SERVER_HEADLESS=true
STREAMLIT_SERVER_ENABLE_CORS=false

# Python settings
PYTHONUNBUFFERED=1
PYTHONDONTWRITEBYTECODE=1
```

---

## Performance Optimization

### 1. Model Caching

Add to `app.py`:
```python
@st.cache_resource
def load_models():
    # Model loading code
    return models
```

### 2. Memory Management

Monitor resource usage:
```python
import psutil
print(f"Memory: {psutil.virtual_memory().percent}%")
```

### 3. Streamlit Config

Create `.streamlit/config.toml`:
```toml
[server]
maxUploadSize = 200
maxMessageSize = 200

[browser]
gatherUsageStats = false
```

---

## Security Best Practices

### 1. HTTPS Configuration

Always use HTTPS in production:
- Streamlit Cloud: Automatic
- Custom domain: Use Let's Encrypt
- Cloud platforms: Built-in SSL

### 2. Authentication

Add authentication layer:
```python
import streamlit_authenticator as stauth

authenticator = stauth.Authenticate(...)
name, auth_status, username = authenticator.login('Login', 'main')

if auth_status:
    # Show app
else:
    # Show login
```

### 3. Rate Limiting

Implement rate limiting for API calls:
```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
```

---

## Monitoring & Logging

### Application Monitoring

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
logger.info("Prediction made")
```

### Error Tracking

Use Sentry:
```bash
pip install sentry-sdk
```

```python
import sentry_sdk
sentry_sdk.init("YOUR_DSN")
```

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer
- Deploy multiple instances
- Share model storage (S3/GCS)

### Vertical Scaling
- Increase instance size
- Optimize model size
- Use model compression

### Caching Strategy
- Cache predictions
- Use Redis for shared cache
- Implement TTL policies

---

## Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Change port
streamlit run app.py --server.port=8502
```

**Models Not Loading:**
```bash
# Retrain models
python train_models.py
```

**Memory Errors:**
- Reduce batch size
- Increase instance memory
- Optimize model loading

**Slow Performance:**
- Enable caching
- Upgrade instance type
- Optimize data loading

---

## Production Checklist

Before going live:

- [ ] All models trained and tested
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Monitoring set up
- [ ] Backup strategy defined
- [ ] Documentation updated
- [ ] Security reviewed
- [ ] Performance tested
- [ ] Cost optimized

---

## Cost Optimization

### Free Tier Options
- Streamlit Cloud: Free for public repos
- Heroku: Free tier available
- GCP/AWS: Free tier for 12 months

### Cost-Effective Choices
1. Streamlit Cloud (Recommended for MVP)
2. Cloud Run (Pay per use)
3. Shared hosting with Docker

### Monitoring Costs
- Set billing alerts
- Use cost estimation tools
- Monitor resource usage
- Scale based on demand

---

## Support & Resources

**Documentation:**
- Streamlit: https://docs.streamlit.io
- Docker: https://docs.docker.com
- AWS: https://docs.aws.amazon.com
- GCP: https://cloud.google.com/docs

**Community:**
- Streamlit Forum
- Stack Overflow
- GitHub Issues

---

**Choose the deployment option that best fits your needs:**

| Platform | Best For | Cost | Ease |
|----------|----------|------|------|
| Streamlit Cloud | MVP, demos | Free | ⭐⭐⭐⭐⭐ |
| Docker | Anywhere | Varies | ⭐⭐⭐⭐ |
| Heroku | Quick deploy | $$ | ⭐⭐⭐⭐ |
| AWS/GCP | Enterprise | $$$ | ⭐⭐⭐ |

---

**Ready to deploy? Start with Streamlit Cloud for the easiest path! 🚀**
