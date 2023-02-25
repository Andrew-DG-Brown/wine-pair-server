import { Request, Response } from 'express';
import { Router } from 'express';
import { Colors } from '../configs/console.config.js';
import { FoodController } from '../controllers/food-controller.js';

const router = Router()
//make db for this

router.route('/food-pairing')
    .get(async (req: Request, res: Response) => {
        try {
            const { wine } = req.query as any
            const foodPairing = await FoodController.getPairing(wine)
            if ("error" in foodPairing) {
                console.log(Colors.FgRed, foodPairing)
                res.status(404).json(foodPairing)
            } else {
                res.status(200).json(foodPairing)
            }
        } catch (err: any) {
            console.log(Colors.FgRed, 'Error in food.get')
            res.status(500).send({ 
                error: `in food.get: ${err}`,
                wine: req.query.wine
            })
        }
    })

export default router;