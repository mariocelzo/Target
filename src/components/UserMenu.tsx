import { useState } from 'react';

interface UserMenuProps {
    user: { displayName: string } | null;
    userImage: string | null;
    handleLogout: () => void;
}

export default function UserMenu({ user, userImage, handleLogout }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 focus:outline-none"
            >
                {userImage ? (
                    <img
                        src={userImage}
                        alt="User Avatar"
                        className="w-8 h-8 rounded-full"
                    />
                ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                )}
                <span className="text-white">{user?.displayName || 'Account'}</span>
            </button>
            {isOpen && (
                <ul className="absolute right-0 mt-2 bg-white text-black shadow-lg rounded-md py-2 w-48">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        Profilo
                    </li>
                    <li
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={handleLogout}
                    >
                        Logout
                    </li>
                </ul>
            )}
        </div>
    );
}