FROM registry.hub.docker.com/library/node:22-alpine AS dev

ENV ANTIGENAPP_DIR=/antigenapp

COPY package-lock.json ${ANTIGENAPP_DIR}/package-lock.json
COPY package.json ${ANTIGENAPP_DIR}/package.json
WORKDIR ${ANTIGENAPP_DIR}

RUN npm install

COPY . ${ANTIGENAPP_DIR}

CMD ["npm", "run", "dev", "--", "--host"]

FROM dev AS build-stage

ARG VITE_SENTRY_DSN
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN npm run build

FROM nginx:stable-alpine AS prod

COPY --from=build-stage /antigenapp/build/ /usr/share/nginx/html
COPY nginx-check-env.sh /docker-entrypoint.d/nginx-check-env.sh
RUN chmod 777 /docker-entrypoint.d/nginx-check-env.sh
COPY nginx-prod.conf /etc/nginx/conf.d/default.conf
