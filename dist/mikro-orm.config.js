"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const constant_1 = require("./constant");
const Post_1 = require("./entities/Post");
const User_1 = require("./entities/User");
exports.default = {
    migrations: {
        path: path_1.default.join(__dirname, './migrations'),
        glob: '!(*.d).{js,ts}',
        pattern: /^[\w-]+\d+\.[tj]s$/,
        disableForeignKeys: false
    },
    entities: [Post_1.Post, User_1.User],
    dbName: 'social',
    user: 'bubon',
    password: 'bubon1998',
    type: 'postgresql',
    debug: !constant_1.__prod__
};
//# sourceMappingURL=mikro-orm.config.js.map