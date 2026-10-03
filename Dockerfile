# syntax=docker/dockerfile:1
FROM node:24-slim AS build
WORKDIR /app
RUN npm install -g pnpm@11
COPY . .
RUN --mount=type=secret,id=npm_token \
  if [ -f /run/secrets/npm_token ]; then \
    echo "//npm.pkg.github.com/:_authToken=$(cat /run/secrets/npm_token)" > /root/.npmrc; \
  fi \
  && pnpm install --frozen-lockfile
RUN pnpm build

FROM nginx:alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]