import { Router } from 'express';
import { Request, Response } from 'express';
import { AccountController } from '../controllers/account-controller.js';
import { Validators } from '../middleware/validators.js';

const router = Router()

router.route('/saved-pairings')
    .post(Validators.validateToken, async (req: Request, res: Response) => {
        try {
            const { pairing, uId } = req.body
            const saveRes = await AccountController.savePairing(pairing, uId)
            if (saveRes) {
                res.json({ success: saveRes })
            } else {
                res.json({ error: "Couldn't add pairing" })
            }
        } catch (err: any) {
            res.status(500).json({ error: err })
            throw new Error(err)
        }
    })
    .get(Validators.validateToken, async (req: Request, res: Response) => {
        try {
            const { uId } = req.query
            const getPairings = await AccountController.getAllPairings(Number(uId))
            if (getPairings) {
                res.json(getPairings.saved_pairings)
            } else {
                res.status(400).json({ error: "Couldn't get pairings" })
            }
        } catch (err: any) {
            res.status(500).json({ error: err })
            throw new Error(err)
        }
    })
    .delete(Validators.validateToken, async (req: Request, res: Response) => {
        try {
            const { uId, wine, dish } = req.query
            const getUpdatedPairings = await AccountController.deletePairings(dish as string, wine as string, Number(uId))
            if (getUpdatedPairings) {
                res.json(getUpdatedPairings)
            } else {
                res.status(400).json({ error: "Couldn't get pairings" })
            }
        } catch (err: any) {
            res.status(500).json({ error: err })
            throw new Error(err)
        }
    })

router.route('/profile')
    .put(Validators.validateToken, async (req: Request, res: Response) => {
        try {
            const { username, email, uId } = req.body
            const updateRes = await AccountController.updateProfile(username, email, uId)
            if (updateRes) {
                res.json(updateRes)
            } else {
                res.status(400).json({ error: "Couldn't update profile" })
            }
        } catch (err: any) {
            res.status(500).json({ error: err })
            throw new Error(err)
        }
    })

export default router