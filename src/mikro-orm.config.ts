import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constant";
import { Post } from "./entities/Post";

export default {
    migrations: {
      path: path.join(__dirname ,'./migrations'), 
      glob: '!(*.d).{js,ts}',
      pattern: /^[\w-]+\d+\.[tj]s$/ 
    },
    entities:[Post],
    dbName: 'data',
    user:'data',
    password:'data1998',
    type:'postgresql',
    debug:!__prod__
 } as Parameters<typeof MikroORM.init>[0];