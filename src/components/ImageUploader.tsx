interface ImageUploaderProps {
    image: File | null;
    onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
}

export default function ImageUploader({ image, onImageChange, onRemoveImage }: ImageUploaderProps) {
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
                            onChange={onImageChange}
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
        </div>
    );
}