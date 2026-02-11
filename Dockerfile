# Stage 1: Runtime (Nginx)
# We use a standard Nginx Alpine image for minimum memory footprint
FROM klakegg/hugo:ext-alpine AS builder

WORKDIR /src
COPY . .

# Build the site
# Using --buildFuture as seen in build.sh
RUN hugo --buildFuture --minify

# Stage 2: Runtime (Nginx)
FROM nginx:alpine

# Copy static assets from builder stage
COPY --from=builder /src/public /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
