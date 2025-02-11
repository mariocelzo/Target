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

