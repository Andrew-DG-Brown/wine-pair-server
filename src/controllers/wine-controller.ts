import PoolController from './pool.js';
import axios from 'axios';
import { apiConfig } from '../configs/api.config.js';
import { 
    WinePairObj, FoodWinePairError, FoodWinePairRes, SimpleResponse, ComplexResponse 
} from './interfaces/wine-pair.models.js';
import { StringUtils } from '../utils/string.utils.js';

const poolController = new PoolController("wine")
const { foodToWineApi: { url }, headers } = apiConfig['Recipe-Food-Nutrition']

export default class WineController {
    private static readonly WINE_PAIR_URL: string = apiConfig.winePair.url;
    private static readonly WINE_PAIR_HEADERS = apiConfig.winePair.headers;
    private static readonly FOOD_WINE_URL: string = url;
    private static readonly FOOD_WINE_HEADERS = headers;
    private static readonly NUTRITION_HEADERS = apiConfig['Nutrition by API-Ninjas'].headers
    private static readonly NUTRITION_URL = apiConfig['Nutrition by API-Ninjas'].url

    static async getPairing(dish: any, maxPrice?: number): Promise<SimpleResponse | ComplexResponse | { error: string, dish: string }> {
        try {
            if (await this.isValidFood(dish)) {
                return { error: `Couldn't find pairing for ${dish}`, dish: dish }
            }
            const foodWinePair = await this.getComplexWinePair(dish, maxPrice)
            if (foodWinePair == null) {
                const simplePairRes = await this.getSimpleWinePair(dish)
                return 'error' in simplePairRes ? simplePairRes : {
                    pairing: simplePairRes,
                    dish: StringUtils.capitalizeFirsts(dish),
                    maxPrice: maxPrice || null,
                    type: 'simple'
                } as SimpleResponse
            } else {
                return {
                    ...foodWinePair,
                    dish: StringUtils.capitalizeFirsts(dish),
                    maxPrice: maxPrice || null,
                    type: 'complex'
                } as ComplexResponse
            }
        } catch (err) {
            throw new Error(`\nERROR THROWN: Error in getting wine data: ${err}`)
        }
    }
    
    private static async getComplexWinePair(food: any, maxPrice?: any): Promise<FoodWinePairRes | null> {
        try {
            //TODO: maybe cache on new table?
            const pairedWines = await axios.get<FoodWinePairError | FoodWinePairRes>(this.FOOD_WINE_URL, { headers: this.FOOD_WINE_HEADERS, params: { food: food, maxPrice: maxPrice } });
            if (this.isFoodWinePairError(pairedWines.data) || pairedWines.data.pairedWines.length === 0) {
                return null
            } else {
                //TODO: maybe delete the keys not being used on the FE?
                const addDataToPairings = await Promise.all(pairedWines.data.pairedWines.map(async (wineName: any) => {
                    const winefollyData = await poolController.query('SELECT image_url, link, description FROM winefolly_data WHERE lower(wine_name) = lower($1)', [this.handleWineName(wineName)])
                    return winefollyData.rows[0] == null ? {
                        wine_name: StringUtils.capitalizeFirsts(wineName)
                    } : {
                        wine_name: StringUtils.capitalizeFirsts(wineName),
                        ...winefollyData.rows[0]
                    }
                }))
                return {
                    ...pairedWines.data,
                    pairedWines: addDataToPairings
                }
            }
        } catch (err) {
            throw new Error(`\nERROR THROWN: Error in parsing FoodWine response: ${err}`)
        }
    }

    private static async getSimpleWinePair(dish: any): Promise<Array<object> | { error: string, dish: string }> {
        try {
            const cachedCheck = await poolController.query("SELECT * FROM dish_data WHERE lower(foodQuery) = lower($1)", [dish])
            if (cachedCheck.rows[0] == null || cachedCheck.rows.length < 3) {
                const { data } = await axios.get(this.WINE_PAIR_URL, { headers: this.WINE_PAIR_HEADERS, params: { query: dish } });
                console.log('error res:', data)
                const winePairings: Array<WinePairObj> | null = this.handleApiRes(data)
                if (winePairings == null) {
                    return { error: "Something went wrong, try again", dish: dish }
                }
                
                const fullPairingPayload = await Promise.all(winePairings.map(async (wine: WinePairObj) => {                    
                    const { name, description } = wine
                    const selectedWine = await poolController.query("SELECT * FROM winefolly_data WHERE lower(wine_name) = lower($1)", [name])
                    
                    if (selectedWine.rows[0] == null) {
                        return wine;
                    } else {
                        delete selectedWine.rows[0].id
                        
                        const fullDishPayload = {
                            pairdescription: description,
                            pairname: name,
                            foodquery: dish,
                            ...selectedWine.rows[0]
                        }
                        
                        const cachedDish = await poolController.insert({ payload: fullDishPayload, tableName: 'dish_data' })
                        return cachedDish.rows[0]
                    }
                }))
                return fullPairingPayload
            } else {
                return cachedCheck.rows
            }
        } catch (err) {
            throw new Error(`\nERROR THROWN: Error in getting simple wine wine data: ${err}`)
        }
    }

    private static async isValidFood(dish: string): Promise<boolean> {
        const checkFood = await axios.get<Array<any>>(this.NUTRITION_URL, { headers: this.NUTRITION_HEADERS, params: { query: dish } })
        return checkFood.data[0] == null;
    }
    
    private static handleApiRes(res: Array<any> | object | string): Array<WinePairObj> | null {
        if (Array.isArray(res)) {
            return res
        } else if (Array.isArray(Object.values(res)[0])) {
            return Object.values(res)[0]
        } else if (typeof res === 'string') {
            return null
        } else {
            return Object.values(res)
        }
    }

    private static isFoodWinePairError(object: any): object is FoodWinePairError {
        return 'status' in object;
    }

    private static handleWineName(name: string): string {
        return name.replace('wine', '').trim()
    }

    private static async isPairingSaved(dish: string, wine: string) {
        const res = await poolController.query(
            `SELECT EXISTS (SELECT saved_pairings
            FROM user_account_data
            WHERE user_id = 9
            AND EXISTS (SELECT * FROM jsonb_array_elements(saved_pairings) as r(pairing)
                WHERE (pairing ->> 'dish')::text = '${dish}'
                AND (pairing ->> 'wine_name')::text = '${wine}'))`
        )
    } 
}