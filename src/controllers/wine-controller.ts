import PoolController from './pool.js';
import axios from 'axios';
import api_config from '../configs/api.config.js';
import { 
    WinePairObj, FoodWinePairError, FoodWinePairRes, SimpleResponse, ComplexResponse 
} from './interfaces/wine-pair.models.js';
import { StringUtils } from '../utils/string.utils.js';
import OpenAi from '../services/openai-service.js';
import { SavedPairings } from '../services/saved-pairings.js';

const apiConfig = api_config()
const { foodToWineApi: { url }, headers } = apiConfig['Recipe-Food-Nutrition']

export default class WineController {
    private readonly FOOD_WINE_URL: string = url;
    private readonly FOOD_WINE_HEADERS = headers;
    private readonly NUTRITION_HEADERS = apiConfig['Nutrition by API-Ninjas'].headers
    private readonly NUTRITION_URL = apiConfig['Nutrition by API-Ninjas'].url
    private poolController: PoolController;
    private uId: string;

    constructor(uId: string) {
        this.poolController = new PoolController("wine")
        this.uId = uId;
    }

    async getPairing(dish: any, maxPrice?: number) {
        try {
            if (await this.notValidFood(dish)) {
                return { error: `Couldn't find pairing for ${dish}`, dish }
            }
            
            const complexRes = await this.getComplexWinePair(dish, maxPrice)
            const dishTitle = StringUtils.capitalizeFirsts(dish)
            if (complexRes == null) {
                
                const simplePairRes = await this.getSimpleWinePair(dish)
                if ('error' in simplePairRes) return simplePairRes

                const pairedWines = await this.buildPairingsPayload(dishTitle, simplePairRes, 'simple')
                return {
                    pairedWines,
                    dish: dishTitle,
                    maxPrice: maxPrice || null,
                    type: 'simple'
                } as SimpleResponse
            }

            const paired_wines = await this.buildPairingsPayload(dishTitle, complexRes, 'complex')
            return {
                ...complexRes,
                paired_wines,
                dish: dishTitle,
                maxPrice: maxPrice || null,
                type: 'complex'
            } as ComplexResponse
        } catch (err) {
            throw new Error(`\nwine data: ${err}`)
        }
    }
    
    private async getComplexWinePair(food: any, maxPrice?: any): Promise<FoodWinePairRes | null> {
        try {
            const cachedCheck = await this.poolController.query(`SELECT * FROM complex_dish_data WHERE lower(foodquery) = lower('${food}')`)

            if (cachedCheck.rows[0] == null) {
                const pairedWines = await axios.get(this.FOOD_WINE_URL, { headers: this.FOOD_WINE_HEADERS, params: { food: food, maxPrice: maxPrice } });
                if (this.isFoodWinePairError(pairedWines.data) || pairedWines.data.pairedWines.length === 0) {
                    return null
                }
    
                const addDataToPairings = await Promise.all(pairedWines.data.pairedWines.map(async (wineName: any) => {
                    const winefollyData = await this.poolController.query(`SELECT image_url, link, description FROM winefolly_data WHERE lower(wine_name) LIKE lower('%${this.handleWineName(wineName)}%')`)
    
                    if (winefollyData?.rows[0] == null) {
                        const description = await OpenAi.getWineDescription(wineName)
                        return {
                            wine_name: StringUtils.capitalizeFirsts(wineName),
                            description,
                            link: `https://www.wine-searcher.com/find/${wineName}`
                        }
                    } 
                    return {
                        wine_name: StringUtils.capitalizeFirsts(wineName),
                        ...winefollyData?.rows[0]
                    }
                }))
    
                const complexPair =  {
                    pairing_text: pairedWines.data.pairingText,
                    paired_wines: addDataToPairings || [],
                    product_matches: this.handleProductMatches(pairedWines.data.productMatches),
                    foodquery: food
                }

                const cachedDish = await this.poolController.insert({ payload: complexPair, tableName: 'complex_dish_data' })
                return cachedDish.rows[0]
            }
            return cachedCheck.rows[0]
        } catch (err) {
            throw new Error(`\nERROR THROWN: Error in parsing FoodWine response: ${err}`)
        }
    }

    private async getSimpleWinePair(dish: any): Promise<Array<object> | { error: string, dish: string }> {
        try {
            const cachedCheck = await this.poolController.query(`SELECT * FROM dish_data WHERE lower(foodQuery) = lower('${dish}')`)
            if (cachedCheck.rows[0] == null || cachedCheck.rows.length < 3) {

                let winePairings = await OpenAi.dishToWineQuery(dish)
                if (winePairings == null) return { error: "Something went wrong, try again", dish: dish }
                
                const fullPairingPayload = await Promise.all(winePairings.map(async (wineObj: WinePairObj) => {                    
                    const { name, description, wine } = wineObj
                    const selectedWine = await this.poolController.query(`SELECT * FROM winefolly_data WHERE lower(wine_name) LIKE lower('%${name || wine}%')`)
                    
                    if (selectedWine.rows[0] == null) {
                        return { 
                            wine_name: name || wine, 
                            description,
                            link: `https://www.wine-searcher.com/find/${name || wine}`
                        };
                    } else {
                        delete selectedWine.rows[0].id
                        
                        const fullDishPayload = {
                            pairdescription: description,
                            pairname: name || wine,
                            foodquery: dish,
                            ...selectedWine.rows[0]
                        }
                        
                        const cachedDish = await this.poolController.insert({ payload: fullDishPayload, tableName: 'dish_data' })
                        return cachedDish.rows[0]
                    }
                }))
                return fullPairingPayload
            }
            return cachedCheck.rows
        } catch (err) {
            throw new Error(`\nERROR THROWN: Error in getting simple wine wine data: ${err}`)
        }
    }

    private async notValidFood(dish: string): Promise<boolean> {
        const checkFood = await axios.get<Array<any>>(this.NUTRITION_URL, { headers: this.NUTRITION_HEADERS, params: { query: dish } })
        return !checkFood?.data.length;
    }

    private isFoodWinePairError(object: any): object is FoodWinePairError {
        return 'status' in object;
    }

    private handleWineName(name: string): string {
        return name.replace('wine', '').trim()
    }

    private handleProductMatches(productMatches: Array<any>): Array<any> {
        return productMatches.map((product) => {
            delete product.imageUrl
            return {
                ...product,
                averageRating: (product.averageRating * 100).toFixed(0)
            }
        })
    }

    private async buildPairingsPayload(dish: string, payload: any, type: 'simple' | 'complex') {
        if (this.uId == undefined) return payload;

        let pairedWines = type == 'simple' ? payload : payload.paired_wines;

        pairedWines = pairedWines.map(async (wine: any) => {
            const isSaved = await SavedPairings.isPairingSaved(dish, wine.wine_name, Number(this.uId))
            return { ...wine, isSaved }
        })

        return await Promise.all(pairedWines)
    }
}