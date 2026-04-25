FROM nginx:alpine
RUN apk add --no-cache gettext && \
    sed -i 's/listen       80;/listen       8080;/' /etc/nginx/conf.d/default.conf
COPY . /usr/share/nginx/html
EXPOSE 8080
CMD envsubst < /usr/share/nginx/html/js/config.js.template > /usr/share/nginx/html/js/config.js && \
    nginx -g "daemon off;"