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
        <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Explorar por Categorías
            </h2>
            <p className="text-gray-600 mb-6">
                Descubre destinos organizados por tipo de experiencia
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {categories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => onCategoryChange(category.slug)}
                        className={`
                            relative p-4 rounded-xl border-2 transition-all duration-300 text-left group
                            ${activeCategory === category.slug
                                ? 'border-eco-teal-500 bg-eco-teal-50'
                                : 'border-gray-100 bg-white hover:border-eco-teal-200 hover:shadow-lg'
                            }
                        `}
                    >
                        <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3
                            ${activeCategory === category.slug
                                ? 'bg-eco-teal-500 text-white'
                                : 'bg-eco-teal-100 text-eco-teal-600 group-hover:bg-eco-teal-500 group-hover:text-white transition-colors'
                            }
                        `} dangerouslySetInnerHTML={{ __html: category.icon }} />

                        <h3 className="font-bold text-gray-800 mb-1 group-hover:text-eco-teal-700">
                            {category.name}
                        </h3>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{category.count} {category.count === 1 ? 'lugar' : 'lugares'}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategorySection;
