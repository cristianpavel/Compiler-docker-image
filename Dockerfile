FROM node:6.10.0-alpine
WORKDIR /app
COPY package.json /app
ENV USER=compiler
ENV UID=1001
ENV GID=1001
RUN apk add --no-cache make gcc g++ python &&\
    npm install &&\
    addgroup -g "$GID" "$USER" \
    && adduser \
    -D \
    -g "" \
    -H \
    -G "$USER" \
    -u "$UID" \
    "$USER"
COPY index.js /app
CMD node index.js
EXPOSE 3000
