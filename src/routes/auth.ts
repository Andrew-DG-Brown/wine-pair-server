import express from 'express'
import { Request, Response, NextFunction } from 'express';
import AuthController from '../controllers/auth-controller.js';
import bcrypt from 'bcrypt';
import ms from 'ms'
import { Validators } from '../middleware/validators.js';

// ================ Routes ================

const router = express.Router()

router.route('/register')
    .post(async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;
            const hash = await bcrypt.hash(password, 10)
            const registerRes = await AuthController.registerUser({
                email: email, password: hash
            })
            const accessToken = AuthController.createToken(registerRes)
            res.cookie("accessToken", accessToken, { maxAge: ms('30 days'), httpOnly: true})
            res.cookie("uId", registerRes.id, { maxAge: ms('30 days'), httpOnly: true})
            res.send({ email, status: 'logged in', uId: registerRes.id })
        } catch (err: any) {
            res.status(500).json({ error: 'ERROR in user register' })
            throw new Error(err)
        }
    })

router.route('/login')
    .post( async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body
            const user = await AuthController.loginUser({ email, password })
            if (!user) res.status(400).json({ error: "User does not exist" })
            const dbPassword = user.password as string
            const isPassCorrect = await bcrypt.compare(password, dbPassword)
            if (!isPassCorrect) {
                res.status(400).json({ error: 'Wrong password for given email' })
            }
            const accessToken = AuthController.createToken(user)
            delete user.password
            res.cookie("accessToken", accessToken, { maxAge: ms('30 days'), httpOnly: true})
            res.cookie("uId", user.id, { maxAge: ms('30 days'), httpOnly: true})
            res.send({ ...user, uId: user.id })
        } catch (err: any) {
            res.status(500).json({ error: "ERROR couldn't login user" })
            throw new Error(err)
        }
    })

router.route('/logout')
    .get(async (req: Request, res: Response) => {
        try {
            res.cookie('accessToken', '', { maxAge: 1 });
            res.json({ success: true })
        } catch (err: any) {
            res.status(400).json({ error: err })
        }
    })

router.route('/profile')
    .get(Validators.validateToken, (req: Request, res: Response) => {
        res.send('User data')
    })
    .put(Validators.validateToken, (req: Request, res: Response) => {
        res.send('Updated user profile')
    })
    .post(Validators.validateToken, (req: Request, res: Response) => {
        res.send('Added to profile')
    })

router.route('/email-validate')
    .post( async (req: Request, res: Response) => {
        try {
            const { email } = req.body
            const user = await AuthController.loginUser({ email })
            if (!user) {
                res.json({ error: "Email is not registered" })
            } else {
                res.json({ valid: true })
            }
        } catch (err: any) {
            res.status(500).json({ reject: "ERROR couldn't validate user" })
            throw new Error(err)
        }
    })



export default router;