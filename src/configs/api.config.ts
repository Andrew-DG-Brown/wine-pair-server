import { config } from 'dotenv';
config()

const { X_RAPIDAPI_KEY, UNSPLASH_ID } = process.env

export const apiConfig = {
    "Recipe-Food-Nutrition": {
        headers: {
            'X-RapidAPI-Key': X_RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
        },
        foodToWineApi: {
            url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/wine/pairing',
        },
        wineToFoodApi: {
            url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/wine/dishes',
        },
    },
    winePair: {
        url: 'https://wine-pair.p.rapidapi.com/winesuggest.php',
        headers: {
            "X-RapidAPI-Key": X_RAPIDAPI_KEY,
            "X-RapidAPI-Host": 'wine-pair.p.rapidapi.com'
        }
    },
    unsplash: {
        url: 'https://api.unsplash.com/search/photos',
        defaultParams: {
            per_page: 1,
            client_id: UNSPLASH_ID
        }
    },
    "Nutrition by API-Ninjas": {
        headers: {
            'X-RapidAPI-Key': X_RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'nutrition-by-api-ninjas.p.rapidapi.com'
        },
        url: 'https://nutrition-by-api-ninjas.p.rapidapi.com/v1/nutrition'
    }
}