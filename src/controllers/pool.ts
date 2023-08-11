import Pool from 'pg-pool'
import { QueryResult } from 'pg';
import { UserData } from './auth-controller.js'

interface InsertConfig {
    tableName: string;
    payload: object;
}

class PoolController {
    pool;

    constructor(dbName: string) {
        const { PG_PASSWORD, PG_USER, PG_HOST, PG_PORT } = process.env
        const config = {
            user: 'postgres',
            password: PG_PASSWORD,
            host: 'localhost',
            port: Number(5432),
            database: dbName
        }
        this.pool = new Pool(config)
        console.log()
    }

    async query(query: string, content?: Array<any>): Promise<QueryResult> {
        return await this.pool.query(query, content);
    }

    async insert({ tableName, payload }: InsertConfig): Promise<QueryResult> {
        const columnsNumString = Object.keys(payload).map((_, index) => `$${index + 1}`). join(', ')
        const values = Object.values(payload).map((val) => {
            return Array.isArray(val) ? JSON.stringify(val) : val
        })

        const insertString = `INSERT INTO ${tableName} (${Object.keys(payload).join(', ')}) VALUES(${columnsNumString}) RETURNING *`

        return await this.pool.query(insertString, values)
    }

    async update(tableName: string, payload: object, uId: number) {
        const updateString = Object.entries(payload).map(([column, value]) => {
            return `${column} = '${value}'`
        }).join(', ')
        return await this.pool.query(`UPDATE ${tableName} SET ${updateString} 
            WHERE id = ${uId} RETURNING *`
        )
    }

    async selectColumnWhere(tableName: string, columnName: string, whereQuery: string, whereVal: string | number) {
        return await this.pool.query(`SELECT ${columnName} FROM ${tableName} WHERE ${whereQuery} = ${whereVal}`)
    }

    async getUserData({ email }: UserData): Promise<QueryResult> {
        return await this.pool.query(`SELECT email, password, id, username FROM user_auth WHERE email = ('${email}')`)
    }
}

export default PoolController