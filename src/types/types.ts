import { Request, Response } from "express";
import Redis from "ioredis";

// interface ExtendedRequest extends Request {
// 	session: Session &
// 		Partial<SessionData> &
// 		Express.Request & { userId: number };
// }

export type MyContext = {
    req: Request
    res: Response
    redis:Redis
}