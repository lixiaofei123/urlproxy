# Use Node.js base image
FROM node:latest

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY index.js index.js
COPY index.html index.html

EXPOSE 3000

CMD ["node", "index.js"]