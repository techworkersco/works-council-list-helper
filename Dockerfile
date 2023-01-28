FROM node:lts as build

WORKDIR /app

RUN npm install -g pnpm
COPY package.json .
COPY pnpm-lock.yaml .
COPY prisma/schema.prisma .

RUN pnpm install

COPY . .

RUN yarn build

FROM node:lts

ENV PORT 3000
EXPOSE 3000

WORKDIR /usr/src/app

COPY --from=build /app .
COPY docker-start.sh .
RUN chmod u+x ./docker-start.sh

ENTRYPOINT ["./docker-start.sh"]
