# Use an official Python runtime as a parent image
FROM python:3.9-slim-buster

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies (if any are needed, e.g., for psycopg2 if not using -binary)
# RUN apt-get update && apt-get install -y --no-install-recommends libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
# Copy requirements first to leverage Docker cache
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project code into the container
# This will copy everything from the build context (ai_marketplace/) to /app in the image.
# .dockerignore will prevent unnecessary files from being copied.
COPY . /app/

# Expose port 8000 for the Django app (this is documentation; `run -p` actually publishes it)
EXPOSE 8000

# Command to run the application
# Ensure '0.0.0.0' is used to allow connections from outside the container.
# For development, using Django's development server.
# For production, this would typically be replaced with Gunicorn or uWSGI.
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
