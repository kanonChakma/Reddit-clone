import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"
import { ApolloServer } from "apollo-server-express"
import connectRedis from "connect-redis"
import cors from 'cors'
import express from "express"
import session from "express-session"
import Redis from "ioredis"
import 'reflect-metadata'
import { buildSchema } from "type-graphql"
import { COOKIE_NAME, __prod__ } from "./constant"
import dataSource from "./ormconfig"
import { HelloResolver } from "./resolvers/hello"
import { PostsResolver } from "./resolvers/posts"
import { UserResolver } from "./resolvers/user"
import { MyContext } from "./types/types"



const main =async() => {
 //------connect database-------
  dataSource.initialize();
 //----server setup-----
 const app = express();
 app.use(cors({
   origin:'http://localhost:3000',
   credentials: true
 }))

 const RedisStore = connectRedis(session)
 const redis = new Redis()
//this when using from reedis <------> import { createClient } from "redis"
 //  const redisClient = createClient({ legacyMode: true })
//  redisClient.connect().catch(console.error)
 
  app.use (
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis as any, disableTouch: true }),
      cookie: {
       maxAge:1000*60*60*24*365*10,
       httpOnly: true,
       sameSite: "lax",
       secure:__prod__
      },
      saveUninitialized: false,
      secret: "akjsdhfkjasdhfkjasdh",
      resave: false,
    })
  )


 const apolloServer = new ApolloServer({
    schema: await buildSchema({
        resolvers: [HelloResolver, PostsResolver, UserResolver],
        validate: false
      }),
      context: ({req, res}):MyContext => ({ req, res, redis}),
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  }); 

  await apolloServer.start();
  apolloServer.applyMiddleware({app, cors:false});
  
  app.listen(4000, ()=>{
    console.log("app is listening");
  })

 }

main().catch((err)=>{
    console.log("Error is ", err);
})
