import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constant";
import { Post } from "./entities/Post";

export default {
    migrations: {
      path: path.join(__dirname ,'./migrations'), 
      glob: '!(*.d).{js,ts}',
      pattern: /^[\w-]+\d+\.[tj]s$/, 
      disableForeignKeys: false
    },
    entities:[Post],
    dbName: 'social',
    user:'bubon',
    password:'bubon1998',
    type:'postgresql',
    debug:!__prod__
 } as Parameters<typeof MikroORM.init>[0];