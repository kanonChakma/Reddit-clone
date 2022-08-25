import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Request, Response } from "express";
import Redis from "ioredis";

// interface ExtendedRequest extends Request {
// 	session: Session &
// 		Partial<SessionData> &
// 		Express.Request & { userId: number };
// }

export type MyContext = {
    em:  EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
    req: Request
    res: Response
    redis:Redis
}