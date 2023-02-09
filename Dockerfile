# syntax=docker/dockerfile:1
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN yarn install --production
CMD ["node", "src/index.js"]
EXPOSE 3000

cd ~
mkdir Docker
cd Docker
touch Dockerfiile
vim Dockerfile
