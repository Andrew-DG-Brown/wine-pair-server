import './env.js'
import App from './app.js';
import auth from './routes/auth.js';
import wine from './routes/wine.js';
import food from './routes/food.js'
import account from './routes/account.js'
import { Request, Response } from 'express';

const app = new App(Number(process.env.PORT) || 4321)
const { express } = app;

const wineRouter = wine
express.use('/api/wine', wineRouter)

const foodRouter = food
express.use('/api/food', foodRouter)

const authRouter = auth
express.use('/api/auth', authRouter)

const accountRouter = account
express.use('/api/account', accountRouter)

express.get('/', (req: Request, res: Response) => {
    res.status(200).send("base GET")
})

