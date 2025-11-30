'use client'
import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner = ({ message = "Chargement...", size = 'md' }: LoadingSpinnerProps) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8', 
        lg: 'w-12 h-12'
    };

    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`}></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm font-medium">
                {message}
            </p>
        </div>
    );
};

export default LoadingSpinner;
