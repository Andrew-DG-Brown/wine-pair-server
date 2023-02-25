import PoolController from "./pool.js";
import { Request, Response, NextFunction } from 'express';
import pkg from 'jsonwebtoken'
import { config } from 'dotenv';
const { sign, verify } = pkg;

const poolController = new PoolController("user_data");
export interface UserData { email: string; password?: string; id?: number | string };

export default class AuthController {
    static async registerUser(userData: UserData) {
        const regResponse = await poolController.insert({ tableName: 'user_auth', payload: userData })
        return regResponse.rows[0]
    }
    
    static async loginUser(userData: UserData): Promise<UserData> {
        const loginRes = await poolController.getUserData(userData)
        console.log(loginRes)
        return loginRes.rows[0]
    }
    
    static createToken(userData: UserData) {
        config();
        return sign(userData, process.env.SECRET as string)
    }
}
