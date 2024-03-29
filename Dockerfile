# Imagen base
FROM node:14

# Copiar archivos necesarios
COPY package*.json ./
COPY src/ ./src/

# Instalar dependencias y compilar la aplicación
RUN npm install
RUN npm run build

# Especificar comando para iniciar la aplicación 
CMD ["node", "dist/index.js"]