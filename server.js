import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import cors from 'cors';
import { UI } from 'bull-board'
const { createQueues } = require('bull-board')

import schema from './data/schema';
const PORT = 8080;
const redisConfig = {
  redis: {
    port: 6379,
    host: 'localhost',
  },
}

const queues = createQueues(redisConfig)
const helloQueue = queues.add('helloQueue') 
helloQueue.process(async job => {
  console.log(`Hello ${job.data.hello}`)
})

helloQueue.add({ hello: 'world' }) 
const app = express();

app.use('*', cors());
app.use('/admin/queue', UI)

const server = new ApolloServer({ 
  schema, 
  subscriptions: { path: "/websocket" }
});

server.applyMiddleware({ app });

const httpServer = createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
});
