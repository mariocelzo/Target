import { motion } from 'framer-motion';
import { EyeIcon, TrashIcon } from 'lucide-react';

interface AdCardProps {
    ad: {
        id: string;
        image: string;
        name: string; // Changed from 'title'
        price: number;
        category: string; // Changed from 'productCategory'
        sold: boolean;
    };
    onDelete?: (adId: string) => void;
    onViewOffers?: (adId: string) => void;
}

export default function AdCard({ ad, onDelete, onViewOffers }: AdCardProps) {
    return (
        <motion.div
            className={`bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl ${
                ad.sold ? 'opacity-70' : ''
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
        >
            <div className="relative">
                <img src={ad.image} alt={ad.name} className="w-full h-48 object-cover" />
                <div className="absolute top-0 right-0 bg-[#41978F] text-white px-2 py-1 m-2 rounded-md text-sm font-semibold">
                    {ad.category}
                </div>
                {ad.sold && (
                    <div className="absolute bottom-0 left-0 bg-red-500 text-white px-2 py-1 m-2 rounded-md text-sm font-semibold">
                        Venduto
                    </div>
                )}
            </div>
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{ad.name}</h3>
                <p className="text-2xl font-bold mb-4 text-[#41978F]">{ad.price} €</p>
                <div className="mb-4">
                    <button
                        onClick={() => onViewOffers && onViewOffers(ad.id)}
                        className="w-full bg-[#41978F] hover:bg-[#357b74] text-white font-bold py-2 px-4 rounded"
                        disabled={!onViewOffers}
                    >
                        <EyeIcon className="h-5 w-5 mr-2 inline" />
                        Mostra offerte
                    </button>
                </div>
                {onDelete && (
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={() => onDelete(ad.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                        >
                            <TrashIcon className="h-5 w-5 mr-2 inline" />
                            Elimina
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
}