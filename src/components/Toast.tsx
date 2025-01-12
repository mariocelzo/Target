// components/Toast.tsx
import { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ToastProps {
    message: string;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 4000); // Durata visibilità toast (es. 4 secondi)
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="flex items-center bg-teal-500 text-white p-4 rounded-md shadow-lg mb-2 animate-fade-in">
            <Image src="/logoNosfondo.png" alt="Logo" width={32} height={32} className="mr-3" />
            <span className="flex-1">{message}</span>
            <button onClick={onClose} className="ml-4 hover:text-gray-300">
                <X size={20} />
            </button>
        </div>
    );
};

export default Toast;