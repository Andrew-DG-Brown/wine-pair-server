import axios from 'axios';
import apiConfig from '../configs/api.config.js';
import PoolController from './pool.js';
import { FoodPairRes, FoodPair } from './interfaces/food-pair.models.js';
import { StringUtils } from '../utils/string.utils.js';

const api_config = apiConfig()
const winePool = new PoolController("wine")
const { wineToFoodApi, headers } = api_config['Recipe-Food-Nutrition']
const { defaultParams, url } = api_config.unsplash

export class FoodController {
    private static readonly FOOD_PAIR_URL: string = wineToFoodApi.url;
    private static readonly FOOD_PAIR_HEADERS = headers;
    private static readonly UNSPLASH_URL: string = url;
    private static readonly UNSPLASH_PARAMS = defaultParams;

    static async getPairing(wineName: string): Promise<FoodPair | { error: string, wine: string }> {
        try {
            const foodPairCall = await this.getWineToFood(wineName)
            if ("text" in foodPairCall && "pairings" in foodPairCall) {
                const attachedImage = await Promise.all(foodPairCall.pairings.map(async (dish) => {
                    const { results } = await this.getFoodPhoto(`${dish} food`)
                    return {
                        image: results[0] && results[0].urls?.small || '',
                        dish: StringUtils.capitalizeFirsts(dish),
                        recipes: `https://www.epicurious.com/search/${dish}`
                    }
                }))
                const wineData = await winePool.query(`SELECT image_url, link FROM winefolly_data WHERE lower(wine_name) = lower('${wineName}')`)
                return {
                    wineData: wineData.rows.length > 0 ? { 
                        wine_query_name: StringUtils.capitalizeFirsts(wineName),
                        ...wineData.rows[0] 
                    } : null,
                    ...foodPairCall,
                    pairings: attachedImage
                }
            } else {
                return { error: "Wine not found", wine: wineName }
            }
        } catch (err: any) {
            throw new Error(`Error in getPairing in foodController: ${err}`)
        }
    }

    private static async getWineToFood(wineName: string): Promise<FoodPairRes> {
        //TODO: make return interfaces (regular and error)
        const { data } = await axios.get<FoodPairRes>(this.FOOD_PAIR_URL, { headers: this.FOOD_PAIR_HEADERS, params: { wine: wineName} })
        return data
    }

    private static async getFoodPhoto(query: string): Promise<any> {
        const { data } = await axios.get<any>(this.UNSPLASH_URL, { params: { query: query, ...this.UNSPLASH_PARAMS } })
        return data
    }
}