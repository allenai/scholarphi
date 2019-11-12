FROM nginx:1.17.0-alpine as build

# Copy over our nginx server configuration, which in this case has some custom
# stuff in it since we're acting as a reverse proxy.
COPY nginx.conf /etc/nginx/nginx.conf
