import { DataSource } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";

 const dataSource = new DataSource({
    type: 'postgres',
    database:'social',
    username:'bubon',
    password:'bubon1998',
    logging: true,
    migrations:["src/migrations/*.ts"],
    synchronize: true,  //create table automatically
    entities:[Post, User]
   });

 export default dataSource;  