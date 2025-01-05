import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ className = '', children, ...props }) => (
    <button
        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring ${className}`}
        {...props}
    >
        {children}
    </button>
);