FROM registry.hub.docker.com/library/node:17-alpine as base

ENV ANTIGENAPP_DIR /antigenapp

COPY . ${ANTIGENAPP_DIR}
WORKDIR ${ANTIGENAPP_DIR}

RUN npm install

CMD ["npm", "start"]