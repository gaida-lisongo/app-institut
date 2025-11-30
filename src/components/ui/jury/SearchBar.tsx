'use client'
import React from 'react';

interface SearchBarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    totalCount: number;
    filteredCount: number;
}

const SearchBar = ({ searchTerm, onSearchChange, totalCount, filteredCount }: SearchBarProps) => {
    return (
        <div className="mb-6">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-sm">🔍</span>
                </div>
                <input
                    type="text"
                    placeholder="Rechercher un étudiant (nom, prénom, matricule)..."
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                {searchTerm && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        ✕
                    </button>
                )}
            </div>
            {searchTerm && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                    <span className="font-medium">{filteredCount}</span> étudiant(s) trouvé(s) sur <span className="font-medium">{totalCount}</span>
                </div>
            )}
        </div>
    );
};

export default SearchBar;
