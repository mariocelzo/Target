import { addProduct, ProductData } from '@/data/productRepository';

/**
 * Convert file to Base64 string.
 */
export function convertToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Add a new product to the marketplace.
 */
export async function createProduct(productData: {
    name: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    userId: string;
    createdAt: Date;
    sold: boolean
}, imageFile: File): Promise<void> {
    // Convert the image file to Base64
    const base64Image = await convertToBase64(imageFile);

    // Add the product to the database
    await addProduct({ ...productData, image: base64Image });
}