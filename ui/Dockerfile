FROM node:12.13.0 as build
WORKDIR /ui

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy over the source code and build
COPY . .
ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}
RUN npm run build && \
    npm run postbuild

FROM nginx:1.17.0-alpine as runtime

# Copy over the static files we built in the previous change, and put them
# where `nginx` serves from by default.
COPY --from=build /ui/build /ui/

# The `nginx.conf` file is included in the code we copied over previously --
# use that so the build is ever so slightly faster.
COPY --from=build /ui/nginx.conf /etc/nginx/nginx.conf
