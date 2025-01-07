export interface ProductDetails {
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    condition: string;
    sold: boolean;
}

export interface Order {
    id: string;
    productName: string;
    price: number;
    createdAt: string;
    productDetails: ProductDetails;
    quantity: number;
}
// types.ts
export interface User {
    fullName: string;
    city: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    sold: boolean;
    user?: User;
}