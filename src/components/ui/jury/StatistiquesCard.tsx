'use client'
import React from 'react';

interface StatistiquesCardProps {
    title: string;
    value: number | string;
    color: 'blue' | 'purple' | 'green' | 'orange' | 'gray';
}

const StatistiquesCard = ({ title, value, color }: StatistiquesCardProps) => {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
        gray: 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg p-4`}>
            <div className="text-2xl font-bold">
                {value}
            </div>
            <div className="text-sm">
                {title}
            </div>
        </div>
    );
};

export default StatistiquesCard;
