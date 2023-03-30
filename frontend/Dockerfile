FROM registry.hub.docker.com/library/node:18-alpine as build-stage

ENV ANTIGENAPP_DIR /antigenapp

COPY package-lock.json ${ANTIGENAPP_DIR}/package-lock.json
COPY package.json ${ANTIGENAPP_DIR}/package.json
WORKDIR ${ANTIGENAPP_DIR}

RUN npm install

COPY . ${ANTIGENAPP_DIR}

RUN npm run build

FROM nginx:stable-alpine as prod

COPY --from=build-stage /antigenapp/build/ /usr/share/nginx/html
COPY nginx-prod.conf /etc/nginx/conf.d/default.conf
