import { MikroORM } from "@mikro-orm/core"
import { Post } from "./entities/Post"
import mikroOrmConfig from "./mikro-orm.config"

const main =async() => {
 const orm = await MikroORM.init(mikroOrmConfig)

 const post = orm.em.create(Post,{title: "hello world"});
 await orm.em.persistAndFlush(post);

await orm.em.nativeInsert(Post, {title: "my first post 2"});

}
main().catch((err)=>{
    console.log(err)
})
//database "social" user: bubon , password:bubon1998