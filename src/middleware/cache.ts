import { Request, Response, NextFunction } from 'express';

export default (req: Request, res: Response, next: NextFunction) => {
    // 5 mins
    const period = 60 * 5
    if (req.method == "GET") {
        res.set("Cache-control", `public, max-age=${period}`)
    } else {
        res.set("Cache-control", "no-store")
    }
    next()
}