import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '@/data/firebase';

const storage = getStorage(app);

/**
 * Upload image to Firebase Storage and return the download URL
 */
export const uploadImageToStorage = async (file: File, userId: string): Promise<string> => {
    try {
        // Create a unique filename
        const timestamp = Date.now();
        const fileName = `${userId}_${timestamp}_${file.name}`;
        
        // Create storage reference
        const storageRef = ref(storage, `product-images/${fileName}`);
        
        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Failed to upload image');
    }
};

/**
 * Compress image before upload to reduce file size
 */
export const compressImage = (file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions
            let { width, height } = img;
            
            if (width > height) {
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const compressedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    } else {
                        reject(new Error('Failed to compress image'));
                    }
                },
                file.type,
                quality
            );
        };

        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};
