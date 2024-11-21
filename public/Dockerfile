# Usa a imagem oficial do Node.js como base
FROM node:14

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia o package.json e o package-lock.json
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todos os arquivos do projeto para o diretório de trabalho
COPY . .

# Expõe a porta que o app vai rodar
EXPOSE 3002

# Comando para rodar o app
CMD ["node", "app.js"]
