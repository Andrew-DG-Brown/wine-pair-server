export interface WinePairObj {
    name?: string;
    wine?: string;
    description: string;
}

export interface FoodWinePairRes {
    paired_wines: Array<string | object>;
    pairing_text: string;
    product_matches: Array<ProductMatches>;
    foodquery: string;
}

export interface FoodWinePairError {
    status: string;
    message: string;
}

interface ProductMatches {
    id: number;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    averageRating: number;
    ratingCount: number;
    score: number;
    link: string;
}

export interface SimpleResponse {
    pairedWines: Array<SimpleResItem>;
    dish: string;
    maxPrice: number | null;
    type: "simple";
}

interface SimpleResItem {
    foodquery: string;
    pairname: string;
    pairdescription: string;
    wine_name?: string;
    description?: string;
    image_url?: string;
    link?: string;
    id?: number;
}

export interface ComplexResponse {
    paired_wines: Array<object>;
    pairing_text: string;
    product_matches: Array<ProductMatches>;
    dish: string;
    maxPrice: number | null;
    type: "complex";
}

interface ProductMatches {
    id: number;
    title: string;
    description: string;
    price: string;
    imageUrl: string;
    averageRating: number;
    ratingCount: number;
    score: number;
    link: string;
}