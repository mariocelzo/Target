// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { addProduct, ProductData } from '@/data/productRepository';

/**
 * Convert file to Base64 string with aggressive compression.
 */
export function convertToBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        // Check file size before conversion
        const maxSize = 2 * 1024 * 1024; // 2MB limit for Base64
        if (file.size > maxSize) {
            reject(new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum allowed: 2MB`));
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            // Check Base64 size (should be roughly 33% larger than original)
            if (result.length > 3 * 1024 * 1024) { // 3MB Base64 limit
                reject(new Error('Image too large after conversion. Please use a smaller image.'));
                return;
            }
            resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Compress image to reduce file size before Base64 conversion.
 */
export function compressImageForBase64(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions (max 600x600 for Base64)
            const maxSize = 600;
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                }
            } else {
                if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress with lower quality
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg', // Convert to JPEG for better compression
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Failed to compress image'));
                    }
                },
                'image/jpeg',
                0.5 // 50% quality for better compression
            );
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
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
    try {
        // Validate image file
        if (!imageFile) {
            throw new Error('Image is required');
        }

        if (!imageFile.type.startsWith('image/')) {
            throw new Error('File must be an image');
        }

        // Compress image if it's large
        let processedImage = imageFile;
        if (imageFile.size > 1024 * 1024) { // If larger than 1MB
            processedImage = await compressImageForBase64(imageFile);
        }

        // Convert to Base64 with compression
        const base64Image = await convertToBase64(processedImage);

        // Add the product to the database
        await addProduct({ ...productData, image: base64Image });
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}