 import { MikroORM } from "@mikro-orm/core"
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core"
import { ApolloServer } from "apollo-server-express"
import connectRedis from "connect-redis"
import cors from 'cors'
import express from "express"
import session from "express-session"
import { createClient } from "redis"
import 'reflect-metadata'
import { buildSchema } from "type-graphql"
import { COOKIE_NAME, __prod__ } from "./constant"
import mikroOrmConfig from "./mikro-orm.config"
import { HelloResolver } from "./resolvers/hello"
import { PostsResolver } from "./resolvers/posts"
import { UserResolver } from "./resolvers/user"
import { MyContext } from "./types/types"

const main =async() => {
 //connect database
 const orm = await MikroORM.init(mikroOrmConfig)
 //run migration 
 await orm.getMigrator().up();
 
 //server setup
 const app = express();
 app.use(cors({
   origin:'http://localhost:3000',
   credentials: true
 }))
 const RedisStore = connectRedis(session)
 const redisClient = createClient({ legacyMode: true })
 redisClient.connect().catch(console.error)
 
  app.use(
    session({
      name:COOKIE_NAME,
      store: new RedisStore({ client: redisClient as any, disableTouch: true }),
      cookie:{
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
      context: ({req, res}):MyContext => ({em: orm.em, req, res}),
      plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  }); 
  await apolloServer.start();
  apolloServer.applyMiddleware({app, cors:false});
  
  app.listen(4000, ()=>{
    console.log("app is listening")
  })
//run sql
//  const post = orm.em.create(Post,{title: "hello world"});
//  await orm.em.persistAndFlush(post);

// await orm.em.nativeInsert(Post, {title: "my first post 2"});
//  const post = await orm.em.find(Post,{});
//  console.log(post);
}
main().catch((err)=>{
    console.log(err)
})
