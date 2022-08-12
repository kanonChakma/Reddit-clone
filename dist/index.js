"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const apollo_server_core_1 = require("apollo-server-core");
const apollo_server_express_1 = require("apollo-server-express");
const connect_redis_1 = __importDefault(require("connect-redis"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = require("redis");
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const constant_1 = require("./constant");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const hello_1 = require("./resolvers/hello");
const posts_1 = require("./resolvers/posts");
const user_1 = require("./resolvers/user");
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: 'http://localhost:3000',
        credentials: true
    }));
    const RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    const redisClient = (0, redis_1.createClient)({ legacyMode: true });
    redisClient.connect().catch(console.error);
    app.use((0, express_session_1.default)({
        name: constant_1.COOKIE_NAME,
        store: new RedisStore({ client: redisClient, disableTouch: true }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: "lax",
            secure: constant_1.__prod__
        },
        saveUninitialized: false,
        secret: "akjsdhfkjasdhfkjasdh",
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, posts_1.PostsResolver, user_1.UserResolver],
            validate: false
        }),
        context: ({ req, res }) => ({ em: orm.em, req, res }),
        plugins: [(0, apollo_server_core_1.ApolloServerPluginLandingPageGraphQLPlayground)({})],
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });
    app.listen(4000, () => {
        console.log("app is listening");
    });
};
main().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=index.js.map