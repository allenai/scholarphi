# NOTE: This Dockerfile is only used in development. It provides a runtime
# environment where the JavaScript build process can run. In production the
# files built by this process are served from disk, while in development a HTTP
# server that's distributed with the UI build tools is used.
FROM node:14.15.1

# Setup a spot for our code
WORKDIR /usr/local/src/skiff/app/ui

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy in the source code
COPY . .

ENTRYPOINT [ "yarn" ]
CMD [ "start" ]
