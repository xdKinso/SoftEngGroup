# Use Node JS v16.x as base image
FROM node:latest

# Create server directory inside image
WORKDIR /app

# Copy the source code
COPY . .

# Install dependencies
RUN npm install

# Expose server port
EXPOSE 3000

# Start server using npm script
CMD [ "npm", "run", "start" ]