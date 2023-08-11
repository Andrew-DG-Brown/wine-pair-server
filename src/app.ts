 import express, { Application } from 'express'
 import cors from 'cors'
 import helmet from 'helmet';
 import { Colors } from './configs/console.config.js';
 import cookieParser from 'cookie-parser'

class App {
    public express: Application;
    private port: number;

    constructor(port: number) {
        this.express = express();
        this.port = port;
        this.initMiddleware()
        this.listen()
    }

    private initMiddleware(): void {
        this.express.use(express.json())
        this.express.use(cors({
            origin: true,
            credentials: true
        }))
        this.express.use(helmet({
            crossOriginEmbedderPolicy: false
          }))
        this.express.use(cookieParser())
        this.express.use(express.static('public'))
    }

    private listen(): void {
        this.express.listen(this.port, () => {
            console.log(Colors.FgCyan, `\n=== listening on port ${this.port} ===\n`)
        })
    }
}

export default App;