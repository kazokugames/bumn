# Image terpisah untuk aplikasi ini. Tidak menyentuh container lain di server.
FROM node:24-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:24-slim
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 DB_PATH=/data/app.db
WORKDIR /app
COPY --from=build --chown=node:node /app ./
RUN mkdir -p /data && chown node:node /data
USER node
EXPOSE 3000
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Di dalam container boleh mendengarkan 0.0.0.0: jaringan container terisolasi. Publikasi port diatur di docker-compose.
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
