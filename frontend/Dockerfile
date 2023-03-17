FROM registry.hub.docker.com/library/node:16-alpine as base

ENV ANTIGENAPP_DIR /antigenapp

COPY package-lock.json ${ANTIGENAPP_DIR}/package-lock.json
COPY package.json ${ANTIGENAPP_DIR}/package.json
WORKDIR ${ANTIGENAPP_DIR}

RUN npm install

COPY . ${ANTIGENAPP_DIR}

CMD ["npm", "start"]
