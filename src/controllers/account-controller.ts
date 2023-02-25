import PoolController from './pool.js'
import { SavedPairings } from '../services/saved-pairings.js'

interface ProfileData { username: string, password: string }
const poolController = new PoolController("user_data")

export class AccountController {
    static async savePairing(pairing: any, uId: number) {
        if (await SavedPairings.isPairingSaved(pairing, uId)) {
            return null
        }
        const { dish, wine_name } = pairing
        return await SavedPairings.insertPairing(dish, uId, wine_name, pairing)
    }

    static async getAllPairings(uId: number) {
        const { rows } = await poolController.selectColumnWhere('user_account_data', 'saved_pairings', 'user_id', uId)
        return rows[0]
    }

    static async deletePairings(dish: string, wine: string, uId: number) {
        const { saved_pairings } = await this.getAllPairings(uId)
        const filteredPairings = saved_pairings.filter((pairing: any) => {
            return !(pairing.wine_name === wine && pairing.dish === dish)
        })
        return await SavedPairings.updateSavedPairings(uId, filteredPairings)
    }

    static async updateProfile(username: string, email: string, uId: number) {
        const { rows } = await poolController.update('user_auth', { username, email }, uId)
        return rows[0]
    }
}