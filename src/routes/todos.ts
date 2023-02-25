import { Router } from 'express';
import { Request, Response } from 'express';
import PoolController from '../controllers/pool.js';

// ======= Old code from tutorial =========

const todoRouter = Router()
const poolController = new PoolController("crudtodo")

todoRouter.route('/')
    .post(async (req: Request, res: Response) => {
        try {
            const { description } = req.body
            const newTodo = await poolController.query("INSERT INTO todo (description) VALUES($1) RETURNING *", [description])
            res.json(newTodo.rows[0])
        } catch (err: any) {
            console.error(err.message)
        }
    })
    .get(async (req: Request, res: Response) => {
        try {
            const allTodos = await poolController.query("SELECT * FROM todo")
            res.json(allTodos.rows)
        } catch (err: any) {
            console.error(err.message)
        }
    })

todoRouter.route('/:id')
    .get(async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const allTodos = await poolController.query("SELECT * FROM todo WHERE todo_id = $1", [id])
            res.json(allTodos.rows[0])
        } catch (err: any) {
            console.error(err.message)
        }
    })
    .put(async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const { description } = req.body
            await poolController.query("UPDATE todo SET description = $1 WHERE todo_id = $2", [description, id])
            res.json(`${id} updated to ${description}`)
        } catch (err: any) {
            console.error(err.message)
        }
    })
    .delete(async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            await poolController.query("DELETE FROM todo WHERE todo_id = $1", [id])
            res.json(`${id} todo was deleted`)
        } catch (err: any) {
            console.error(err.message)
        }
    })
export default todoRouter;