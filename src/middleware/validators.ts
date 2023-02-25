import { Response, NextFunction } from 'express'
import pkg from 'jsonwebtoken'
const { verify } = pkg;

export class Validators {
    // middleware checking IF USER IS AUTHENTICATED
    static validateToken(req: any, res: Response, next: NextFunction) {
        const accessToken = req.cookies["accessToken"]
        if (!accessToken) res.status(400).json({ error: 'User not authenticated' })
        try {
            const isValid = verify(accessToken, process.env.SECRET as string)
            if (isValid) {
                req["authenticated"] = true
                next()
            }
        } catch (err: any) {
            res.status(400).json({ error: err })
        }
    }
}