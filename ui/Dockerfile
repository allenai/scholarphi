FROM node:12.13.1 as build
WORKDIR /ui

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

RUN npm run build
RUN npm run postbuild

FROM nginx:1.17.0-alpine as runtime

COPY --from=build /ui/build /ui/
COPY --from=build /ui/nginx.conf /etc/nginx/nginx.conf
