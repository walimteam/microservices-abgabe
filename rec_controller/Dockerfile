FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install


COPY . .

CMD ["node", "index-skeleton.js"]

EXPOSE 3000
