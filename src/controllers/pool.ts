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
        this.pool = new Pool({
            user: "postgres",
            // password: ""
            host: "localhost",
            port: 5432,
            database: dbName
        })
    }

    async query(query: string, content?: Array<any>): Promise<QueryResult> {
        return await this.pool.query(query, content)
    }

    async insert({ tableName, payload }: InsertConfig): Promise<QueryResult> {
        const columnsNumString = Object.keys(payload).map((_, index) => `$${index + 1}`). join(', ')
        return await this.pool.query(`INSERT INTO ${tableName} (${Object.keys(payload).join(', ')}) VALUES(${columnsNumString}) RETURNING *`, Object.values(payload))
    }

    async update(tableName: string, payload: object, uId: number) {
        const updateString = Object.entries(payload).map(([column, value]) => {
            return `${column} = '${value}'`
        }).join(', ')
        console.log(updateString)
        return await this.pool.query(`UPDATE ${tableName} SET ${updateString} 
            WHERE id = ${uId} RETURNING *`
        )
    }

    async selectColumnWhere(tableName: string, columnName: string, whereQuery: string, whereVal: string | number) {
        return await this.pool.query(`SELECT ${columnName} FROM ${tableName} WHERE ${whereQuery} = ${whereVal}`)
    }

    async getUserData({ email }: UserData): Promise<QueryResult> {
        return await this.pool.query('SELECT email, password, id, username FROM user_auth WHERE email = ($1)', [email])
    }
}

export default PoolController