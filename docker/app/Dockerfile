# Stage 1: Build stage
FROM node:20-alpine AS build-stage

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY ../../package.json ../../package-lock.json ./

# Install dependencies (including dev dependencies)
RUN npm install

# Copy the rest of the application source code
COPY ../../ .

# Stage 2: Production stage
FROM node:20-alpine AS production-stage

# Create a new non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set the working directory inside the container
WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build-stage /app /app

# Install only production dependencies
RUN npm install --only=production

# Change ownership of the app folder to the new user
RUN chown -R appuser:appgroup /app

# Expose the port that the microservice listens on
EXPOSE 3000

# Switch to the non-root user
USER appuser

# Set environment variable to indicate production mode
ENV NODE_ENV=production

# Run the Node.js application when the container starts using npm start
CMD ["npm", "run", "start:all"]

