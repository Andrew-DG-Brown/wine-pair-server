export interface WinePairObj {
    name: string;
    description: string;
}

export interface FoodWinePairRes {
    pairedWines: Array<string | object>;
    pairingText: string;
    productMatches: Array<ProductMatches>;
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
    pairing: Array<SimpleResItem>;
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
    pairedWines: Array<object>;
    pairingText: string;
    productMatches: Array<ProductMatches>;
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