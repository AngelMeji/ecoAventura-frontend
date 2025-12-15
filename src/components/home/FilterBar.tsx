import React, { useState } from 'react';

interface FilterBarProps {
    onSearchChange: (query: string) => void;
    onCategoryChange?: (category: string) => void; // Optional now or removed, keeping for compatibility if needed but better remove
    activeCategory: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
    onSearchChange,
    activeCategory
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        onSearchChange(value);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm p-3 mb-8 border border-gray-100 ring-1 ring-gray-100 max-w-3xl mx-auto shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                        className="h-5 w-5 text-gray-400 group-focus-within:text-eco-primary-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={activeCategory === 'Todos' ? "Buscar destinos, aventuras..." : `Buscar en ${activeCategory}...`}
                    className="w-full pl-11 pr-4 py-3 bg-transparent border border-transparent rounded-xl focus:outline-none focus:bg-eco-bg/50 focus:ring-2 focus:ring-eco-primary-100 transition-all font-medium text-gray-700 placeholder-gray-400"
                />
            </div>
        </div>
    );
};

export default FilterBar;
