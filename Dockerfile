FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g @angular/cli

COPY . .

RUN ng build

FROM nginx:1.25-alpine

COPY --from=builder /app/dist/vot_cu_sens/browser /usr/share/nginx/html

COPY resources/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
