FROM node:current as builder
RUN groupadd -r train-conductor && useradd --no-log-init -r -g train-conductor train-conductor
WORKDIR /usr/src/train-conductor
COPY . ./
RUN npm ci
RUN npm run build

FROM node:current-alpine
WORKDIR /usr/src/train-conductor
COPY --from=builder /usr/src/train-conductor/package*.json ./
COPY --from=builder /usr/src/train-conductor/dist dist/
COPY --from=builder /etc/passwd /etc/passwd
RUN npm ci --production
USER train-conductor
ENTRYPOINT ["npm", "start"]
