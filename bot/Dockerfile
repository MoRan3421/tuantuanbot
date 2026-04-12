FROM node:20-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .
# Cloud Run requires PORT env, and though bots are mostly outbound, 
# health checks might require a port.
EXPOSE 8080
CMD [ "node", "index.js" ]
