FROM node:latest
WORKDIR /home/joey/H5-MiniGame-Lobby
COPY package.json .
RUN yarn
COPY . .
CMD ["yarn", "docker"]