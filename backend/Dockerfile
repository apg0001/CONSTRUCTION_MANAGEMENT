FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (cron 포함)
RUN apt-get update && apt-get install -y \
    gcc \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory for SQLite database and backup directory
RUN mkdir -p /app/data /app/backups /app/logs

# Copy backup script and make it executable
COPY backup_db.py /app/backup_db.py
RUN chmod +x /app/backup_db.py

# Copy crontab file
COPY crontab /etc/cron.d/db-backup

# Set permissions for crontab
RUN chmod 0644 /etc/cron.d/db-backup

# Create log file and set permissions
RUN touch /app/logs/backup.log && chmod 666 /app/logs/backup.log

# Apply cron job
RUN crontab /etc/cron.d/db-backup

# Expose port
EXPOSE 8000

# Copy startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Run the startup script
CMD ["/app/start.sh"]

