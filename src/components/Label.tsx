import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    className?: string;
    children: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({ className = '', children, ...props }) => (
    <label className={`block text-sm font-medium text-gray-700 mb-1 ${className}`} {...props}>
        {children}
    </label>
);