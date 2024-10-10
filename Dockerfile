FROM node:20.14.0
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . . 
RUN npm run build
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3002"]
