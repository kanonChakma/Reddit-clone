"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    database: 'social',
    username: 'bubon',
    password: 'bubon1998',
    logging: true,
    migrations: ["src/migrations/*.ts"],
    synchronize: true,
    entities: [Post_1.Post, User_1.User]
});
exports.default = dataSource;
//# sourceMappingURL=ormconfig.js.map