import App from './app.js';
import auth from './routes/auth.js';
import wine from './routes/wine.js';
import todos from './routes/todos.js'
import food from './routes/food.js'
import account from './routes/account.js'
import { Request, Response } from 'express';

const app = new App(4321)
const { express } = app;

const wineRouter = wine
express.use('/wine', wineRouter)

const foodRouter = food
express.use('/food', foodRouter)

const todosRouter = todos
express.use('/todos', todosRouter)

const authRouter = auth
express.use('/auth', authRouter)

const accountRouter = account
express.use('/account', accountRouter)

express.get('/', (req: Request, res: Response) => {
    res.status(200).send("base GET")
})

