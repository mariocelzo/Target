import { useState } from 'react';

const categories = ['Auto e Moto', 'Moda', 'Elettronica', 'Arredamento'];

export default function CategoryDropdown() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white hover:text-gray-200 focus:outline-none"
            >
                Categorie
            </button>
            {isOpen && (
                <ul className="absolute left-0 mt-2 bg-white text-black shadow-lg rounded-md py-2 w-40">
                    {categories.map((category) => (
                        <li
                            key={category}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => setIsOpen(false)}
                        >
                            {category}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}