FROM node:12.13.0-alpine AS build

WORKDIR /app

# Install all depenedencies. Doing this separately speeds up the build as it
# avoids reinstalling the dependencies everytime the source code changes.
COPY package*.json ./
RUN npm install

# Copy over the source code
COPY . .

# Compile from TypeScript to JavaScript
ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}
RUN npm run build

# We use what's called a "multi stage" build to reduce the size of the final
# image. This allows us to ditch the dependencies and other build time stuff
# we need to build the image, but don't need at runtime.
FROM node:12.13.0-alpine AS runtime

WORKDIR /app

# Install runtime dependencies only.
COPY --from=build /app/package*.json ./
RUN npm install --production

# Copy over the build artifacts from the prior stage.
COPY --from=build /app/dist ./dist

ENV NODE_ENV ${NODE_ENV:-production}

# Kick things off. We use `npm` instead of `node` directly so that signals
# are handled properly.
ENTRYPOINT [ "npm" ]
CMD [ "run", "start:prod" ]
