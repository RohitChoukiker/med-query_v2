# server/Dockerfile

FROM python:3.11-slim

# Python ko thoda optimize karo
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Workdir
WORKDIR /app

# System dependencies (tesseract, postgres, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    poppler-utils \
    tesseract-ocr \
    libtesseract-dev \
    libpq-dev \
    libffi-dev \
    python3-dev \
    libssl-dev \
 && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
# Upgrade pip and increase network timeouts/retries to reduce transient download failures
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --timeout 120 --retries 5 -r requirements.txt

# Project files
COPY . .

# Agar start.sh use karna chahte ho to uncomment karo:
# RUN chmod +x start.sh
# CMD ["bash", "start.sh"]

# FastAPI + Uvicorn
# Use port 8080 to match `docker-compose.yml` and `main.py` default
EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]