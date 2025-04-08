FROM node:18-slim

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copy package.json and package-lock.json before other files
# Utilize Docker cache to save re-installing dependencies if unchanged
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy scripts first and set permissions
COPY wait-for-it.sh /app/wait-for-it.sh
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod 755 /app/wait-for-it.sh /app/docker-entrypoint.sh

# Copy the rest of the application
COPY . .

# Create a non-root user and switch to it
RUN groupadd -r appuser && useradd -r -g appuser appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose the port the app runs on
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Command to run the entrypoint script
CMD ["/app/docker-entrypoint.sh"] 