import '../env.js'

const apiConfig = () => {    
    const { UNSPLASH_ID } = process.env
    console.log('apiConfig env', Boolean(process.env.OPENAI_API_KEY))
    return {
        "Recipe-Food-Nutrition": {
            headers: {
                'X-RapidAPI-Key': process.env.X_RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
            },
            foodToWineApi: {
                url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/wine/pairing',
            },
            wineToFoodApi: {
                url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/wine/dishes',
            },
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
                'X-RapidAPI-Key': process.env.X_RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'nutrition-by-api-ninjas.p.rapidapi.com'
            },
            url: 'https://nutrition-by-api-ninjas.p.rapidapi.com/v1/nutrition'
        }
    }
}

export default apiConfig