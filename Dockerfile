# Use Node.js base image
FROM node:20-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY index.js index.js
COPY domain-validator.js domain-validator.js
COPY index.html index.html

EXPOSE 3000

CMD ["node", "index.js"]