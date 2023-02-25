import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import PoolController from '../controllers/pool.js';
import WineController from '../controllers/wine-controller.js';
import { Colors } from '../configs/console.config.js';



const router = Router()
const poolController = new PoolController("wine")

//TODO: swap the get of this route to descriptive extension ('wine-pairing')
router.route('/')
    .post(async (req: Request, res: Response) => {
        try {
            const { wine_name, image_url, link, description } = req.body
            const wineInsert = await poolController.query("INSERT INTO winefolly_data (wine_name, image_url, link, description) VALUES($1, $2, $3, $4) RETURNING *", [wine_name, image_url, link, description])
            console.log(wineInsert.rows)
            res.json(wineInsert.rows)
        } catch (err: any) {
            res.status(500).send(`\nwine.post: Internal server error: ${err}`)
        }
    })
    .get(async (req: Request, res: Response) => {
        try {
            const { dish, maxPrice } = req.query as any
            const pairing = await WineController.getPairing(dish, maxPrice)
            if ('error' in pairing){
                console.log(Colors.FgRed, pairing)
                //TODO: change to error code and handle on FE with interceptor
                res.status(200).json(pairing)
            } else {
                console.log(pairing)
                res.status(200).json(pairing)
            }
        } catch (err: any) {
            res.status(500).send(err)
        }
    })
    
    //Old get wine data stuff

// router.route('/:name')
//     .get(async (req: Request, res: Response) => {
//         try {
//             const { name } = req.params
//             const selectedWine = await poolController.query("SELECT * FROM winefolly_data WHERE wine_name = $1", [name])
//             if (selectedWine && selectedWine.rows[0] != null) {
//                 res.status(200).json(selectedWine.rows[0])
//             } else {
//                 const allWineNames = await poolController.query("SELECT wine_name, id FROM winefolly_data")
//                 const foundName = allWineNames.rows.find((obj: any) => {
//                     return obj.wine_name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(name)
//                 })
//                 const selectedWine = foundName && await poolController.query("SELECT * FROM winefolly_data WHERE id = $1", [foundName.id])
//                 if (selectedWine && selectedWine.rows[0] != null) {
//                     res.status(200).json(selectedWine.rows[0])
//                 } else {
//                     res.status(404).send('Invalid wine name or wine name not found')
//                 }
//             }
//         } catch (err: any) {
//             res.status(500).send('\nInternal server error')
//         }
//     })

export default router;