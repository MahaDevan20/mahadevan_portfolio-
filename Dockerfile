# Use official Python image
FROM python:3.12-slim

# Set work directory
WORKDIR /app

# Install system dependencies (optional but recommended for email libraries, SSL, etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libssl-dev \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Expose the port your Flask app runs on
EXPOSE 5001
# Set production environment by default inside the image
ENV FLASK_ENV=production

# Run the app using gunicorn and respect the $PORT variable provided by hosting (use shell form)
# Use a shell wrapper so the $PORT env var is expanded at container start time
CMD sh -c "gunicorn -w 4 -b 0.0.0.0:$PORT 'app:app'"
