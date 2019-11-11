FROM node:12.13.0-alpine as build

WORKDIR /ui

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy over the source code.
#
# Right now this includes `nginx.conf`, so updates to that file cause the UI to
# be rebuilt. Given we likely won't update `nginx`.conf` too often we feel this
# is an ok tradeoff for now.
COPY . .

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

# Build the project, which ultimately outputs a bundle w/ the HTML, CSS and
# JavaScript we need.
RUN npm run build
RUN npm run postbuild

FROM nginx:1.17.0-alpine as runtime

# Copy over the static files we built in the previous change, and put them
# where `nginx` serves from by default.
COPY --from=build /ui/build /ui/

COPY nginx.conf /etc/nginx/nginx.conf
