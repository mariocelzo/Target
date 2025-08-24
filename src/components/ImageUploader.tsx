import { useState } from 'react';

interface ImageUploaderProps {
    image: File | null;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
}

export default function ImageUploader({ image, onImageChange, onRemoveImage }: ImageUploaderProps) {
    const [error, setError] = useState<string>('');
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes (for Base64 storage)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setError('');

        if (!file) return;

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            setError(`L'immagine è troppo grande. Dimensione massima: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`);
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Seleziona solo file immagine (JPG, PNG, etc.)');
            return;
        }

        // Pass the file to parent component
        onImageChange(e);
    };

    return (
        <div className="space-y-2">
            <label htmlFor="image-uploader" className="block text-lg font-medium text-gray-800">
                Carica Immagine
            </label>
            <div className="relative">
                {!image ? (
                    <label
                        htmlFor="image-uploader"
                        className="block w-full h-48 border-4 border-dashed border-gray-300 rounded-lg flex justify-center items-center text-gray-500 cursor-pointer hover:border-[#41978F] hover:text-[#41978F] transition"
                    >
                        <span className="text-lg font-semibold">Seleziona un&#39;immagine</span>
                        <input
                            id="image-uploader"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                    </label>
                ) : (
                    <div className="relative w-full h-48">
                        <img
                            src={URL.createObjectURL(image)}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                            type="button"
                            onClick={onRemoveImage}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow-lg hover:bg-red-700 transition"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>
            
            {/* Error message */}
            {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
            )}
            
            {/* File info */}
            {image && (
                <div className="text-sm text-gray-600">
                    <p>Nome: {image.name}</p>
                    <p>Dimensione: {(image.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p>Tipo: {image.type}</p>
                </div>
            )}
            
            {/* Info about compression */}
            <p className="text-xs text-gray-500 italic">
                Le immagini grandi verranno compresse automaticamente per ottimizzare le prestazioni
            </p>
        </div>
    );
}