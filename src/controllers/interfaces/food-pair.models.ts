export interface FoodPairRes {
    text: string;
    pairings: Array<string>;
}

export interface FoodPair {
    wineData: WineDataInFood;
    text: string;
    pairings: Array<Pairings>;
}

interface WineDataInFood {
    wine_query_name: string;
    image_url: string;
    link: string;
}

interface Pairings {
    image: string;
    dish: string;
    recipes: string;
}