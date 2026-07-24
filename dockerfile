# Use a imagem oficial do Node.js como base
FROM node:18-alpine AS build

# Defina o diretório de trabalho no container
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências
RUN npm install

# Copie o restante dos arquivos do projeto
COPY . .

# Compile o projeto Angular
RUN npm run build --prod

# Use uma imagem NGINX oficial como base
FROM nginx:alpine

# Copie os arquivos compilados do projeto Angular para o diretório padrão do NGINX
COPY --from=build /app/docs/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# Exponha a porta 80 para o tráfego HTTP
EXPOSE 80

COPY nginx.conf /etc/nginx/nginx.conf

# Comando para iniciar o NGINX
CMD ["nginx", "-g", "daemon off;"]