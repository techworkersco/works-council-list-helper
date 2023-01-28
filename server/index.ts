import fastify from "fastify";
import { createGraphQLHandler } from "./graphql";
import { join } from 'path'

const app = fastify({ logger: true });

app.route({
  url: "/graphql",
  method: ["GET", "POST", "OPTIONS"],
  handler: createGraphQLHandler(app),
});

app.register(require('@fastify/static'), {
  root: join(__dirname, 'build'),
})

app.route({
  url: "/",
  method: ["GET"],
  handler: createGraphQLHandler(app),
});

app.listen((error, address) => {
  if(error) {
    console.error(error)
  }
  else {
    console.log(`Server listening at ${address}`)
  }
});
