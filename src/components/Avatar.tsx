import React from 'react';

interface AvatarProps {
    className?: string;
    children?: React.ReactNode;
}

interface AvatarImageProps {
    src: string;
    alt: string;
    className?: string;
}

interface AvatarFallbackProps {
    children: React.ReactNode;
    className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ className = '', children }) => (
    <div className={`rounded-full overflow-hidden ${className}`}>{children}</div>
);

export const AvatarImage: React.FC<AvatarImageProps> = ({ src, alt, className = '' }) => (
    <img src={src} alt={alt} className={`w-full h-full object-cover ${className}`} />
);

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children, className = '' }) => (
    <div
        className={`w-full h-full flex items-center justify-center bg-gray-300 text-gray-700 ${className}`}
    >
        {children}
    </div>
);