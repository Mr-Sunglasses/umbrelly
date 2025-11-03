# Docker Deployment Guide

This guide covers deploying umbrelly using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)

## Quick Start

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd umbrelly-shot-2
   ```

2. **Build and start the container**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Open your browser and navigate to: http://localhost:3000
   - The app is now running and ready to use!

4. **View logs**
   ```bash
   docker-compose logs -f umbrelly
   ```

5. **Stop the container**
   ```bash
   docker-compose down
   ```

### Using Docker CLI

1. **Build the image**
   ```bash
   docker build -t umbrelly .
   ```

2. **Run the container**
   ```bash
   docker run -d \
     --name umbrelly \
     -p 3000:3000 \
     --restart unless-stopped \
     umbrelly
   ```

3. **View logs**
   ```bash
   docker logs -f umbrelly
   ```

4. **Stop and remove**
   ```bash
   docker stop umbrelly
   docker rm umbrelly
   ```

## Configuration

### Environment Variables

You can customize the application using environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Port the app listens on |

#### Example with custom port:

```bash
docker run -d \
  --name umbrelly \
  -p 8080:8080 \
  -e PORT=8080 \
  umbrelly
```

Or in `docker-compose.yml`:

```yaml
services:
  umbrelly:
    # ... other config
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
```

## Multi-Stage Build

The Dockerfile uses a multi-stage build for optimal image size:

1. **deps**: Installs dependencies
2. **builder**: Builds the Next.js application
3. **runner**: Creates the production runtime image

This results in a minimal production image (~150MB) with only necessary files.

## Health Check

The container includes a built-in health check that:
- Runs every 30 seconds
- Checks if the app responds on port 3000
- Marks container as unhealthy after 3 failed attempts

Check health status:
```bash
docker ps
# or
docker inspect umbrelly --format='{{.State.Health.Status}}'
```

## Network Configuration

The docker-compose setup creates a bridge network called `umbrel-network`. This allows:
- Isolated networking
- Easy service discovery
- Connection to other services if needed

## Volumes (Optional)

If you want to persist any data or customize configuration, you can mount volumes:

```yaml
services:
  umbrelly:
    volumes:
      - ./custom-config:/app/config
```

## Troubleshooting

### Container won't start

1. Check logs:
   ```bash
   docker-compose logs umbrelly
   ```

2. Check if port 3000 is already in use:
   ```bash
   lsof -i :3000
   ```

3. Try rebuilding:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up -d
   ```

### Container is unhealthy

1. Check logs for errors:
   ```bash
   docker-compose logs -f
   ```

2. Exec into container:
   ```bash
   docker exec -it umbrelly sh
   ```

3. Test health endpoint manually:
   ```bash
   docker exec umbrelly wget -qO- http://localhost:3000
   ```

### Out of disk space

1. Clean up unused Docker resources:
   ```bash
   docker system prune -a
   ```

## Production Recommendations

1. **Use a reverse proxy** (nginx/Caddy) for HTTPS
2. **Set resource limits**:
   ```yaml
   services:
     umbrelly:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

3. **Enable automatic updates** using Watchtower or similar
4. **Monitor logs** with a logging solution
5. **Regular backups** of your docker-compose.yml and any custom configs

## Security Notes

- The container runs as non-root user (nextjs:nodejs)
- Only port 3000 is exposed
- No sensitive data is stored in the container
- All dependencies are from official sources

## Support

For issues or questions:
- Check the logs first
- Review the main README.md
- Open an issue on GitHub

