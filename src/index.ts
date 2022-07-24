import { MikroORM } from "@mikro-orm/core"
import { ApolloServer } from "apollo-server-express"
import express from "express"
import 'reflect-metadata'
import { buildSchema } from "type-graphql"
import mikroOrmConfig from "./mikro-orm.config"
import { HelloResolver } from "./resolvers/hello"
import { PostsResolver } from "./resolvers/posts"
import { UserResolver } from "./resolvers/user"


const main =async() => {
 //connect database
 const orm = await MikroORM.init(mikroOrmConfig)
 //run migration 
 await orm.getMigrator().up();
 
 //server setup
 const app = express();

 const apolloServer = new ApolloServer({
    schema: await buildSchema({
        resolvers: [HelloResolver, PostsResolver, UserResolver],
        validate: false
      }),
      context: () => ({
        em: orm.em
      })
  }); 
  await apolloServer.start();
  apolloServer.applyMiddleware({app});
  
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
