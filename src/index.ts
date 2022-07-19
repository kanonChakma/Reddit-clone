import { MikroORM } from "@mikro-orm/core"
import { Post } from "./entities/Post"
import mikroOrmConfig from "./mikro-orm.config"

const main =async() => {

 //connect database
 const orm = await MikroORM.init(mikroOrmConfig)

 //run migration 
 await orm.getMigrator().up();

 //run sql
//  const post = orm.em.create(Post,{title: "hello world"});
//  await orm.em.persistAndFlush(post);

// await orm.em.nativeInsert(Post, {title: "my first post 2"});
 const post = await orm.em.find(Post,{});
 console.log(post);
}
main().catch((err)=>{
    console.log(err)
})
