import React from 'react';

interface CategoryStat {
    name: string;
    slug: string; // Added slug
    count: number;
    avgRating: number;
    icon: string;
}

interface CategorySectionProps {
    categories: CategoryStat[];
    activeCategory: string; // This will now be slug
    onCategoryChange: (categorySlug: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
    categories,
    activeCategory,
    onCategoryChange
}) => {
    return (
        <div className="mb-12">
            <h2 className="text-3xl font-bold text-eco-primary-900 mb-2 font-display">
                Explorar por Categorías
            </h2>
            <p className="text-eco-text-light mb-8 font-medium">
                Descubre destinos organizados por tipo de experiencia
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => onCategoryChange(category.slug)}
                        className={`
                            relative p-5 rounded-2xl border transition-all duration-300 text-left group
                            ${activeCategory === category.slug
                                ? 'border-eco-primary-500 bg-eco-primary-50 shadow-md ring-1 ring-eco-primary-500'
                                : 'border-gray-100 bg-white hover:border-eco-primary-200 hover:shadow-lg hover:-translate-y-1'
                            }
                        `}
                    >
                        <div className={`
                            w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-4 transition-colors duration-300
                            ${activeCategory === category.slug
                                ? 'bg-eco-primary-600 text-white shadow-inner'
                                : 'bg-eco-primary-50 text-eco-primary-600 group-hover:bg-eco-primary-600 group-hover:text-white'
                            }
                        `}>
                            {category.icon}
                        </div>

                        <h3 className={`font-bold text-lg mb-1 transition-colors ${activeCategory === category.slug ? 'text-eco-primary-900' : 'text-gray-800 group-hover:text-eco-primary-700'}`}>
                            {category.name}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-eco-text-light font-medium">
                            <span>{category.count} {category.count === 1 ? 'lugar' : 'lugares'}</span>
                            <div className="flex items-center bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                <span className="text-yellow-700">{category.avgRating}</span>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div >
    );
};

export default CategorySection;
