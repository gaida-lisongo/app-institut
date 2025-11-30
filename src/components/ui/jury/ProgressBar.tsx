'use client'
import React from 'react';

interface ProgressBarProps {
    progress: number; // 0-100
    message?: string;
    isVisible: boolean;
}

const ProgressBar = ({ progress, message = "Sauvegarde en cours...", isVisible }: ProgressBarProps) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-600 dark:text-blue-400 text-xl">💾</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        Sauvegarde des notes
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {message}
                    </p>
                </div>

                {/* Barre de progression */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                    <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                    ></div>
                </div>

                {/* Pourcentage */}
                <div className="text-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Math.round(progress)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
