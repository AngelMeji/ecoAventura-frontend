import React from 'react';


// URL base para las imágenes (asumiendo que vienen relativas del backend)
// Si VITE_API_URL es http://localhost:8000/api, las imagenes estan en http://localhost:8000/storage/
const STORAGE_URL = import.meta.env.VITE_API_URL?.replace('/api', '/storage') || 'http://localhost:8000/storage';

interface DestinationCardProps {
    destination: any;
    isHighlighted?: boolean;
    onClick?: () => void;
}

const DestinationCard: React.FC<DestinationCardProps> = ({
    destination,
    isHighlighted = false,
    onClick
}) => {
    // Obtener color por categoría (ajustar lógica si category es objeto o string)
    const getCategoryColor = (categoryName: string) => {
        const colors: Record<string, string> = {
            'Naturaleza': 'bg-green-50 text-green-700 border border-green-200',
            'Aventura': 'bg-amber-50 text-amber-700 border border-amber-200',
            'Cascadas': 'bg-cyan-50 text-cyan-700 border border-cyan-200',
            'Termal': 'bg-rose-50 text-rose-700 border border-rose-200',
            'Fauna': 'bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200',
            'Senderismo': 'bg-lime-50 text-lime-700 border border-lime-200',
        };
        return colors[categoryName] || 'bg-gray-50 text-gray-700 border border-gray-200';
    };

    // Helper para obtener URL de imagen (prioriza primary_image_url del backend)
    const getImageUrl = () => {
        // 1. Priorizar primary_image_url si existe (ya viene completa del backend)
        if (destination.primary_image_url) {
            return destination.primary_image_url;
        }

        // 2. Buscar imagen marcada como primaria en el array
        const primaryImage = destination.images?.find((img: any) => img.is_primary);
        if (primaryImage) {
            const path = primaryImage.image_path;
            if (path.startsWith('http')) return path;
            return `${STORAGE_URL}/${path}`;
        }

        // 3. Fallback a la primera imagen
        if (destination.images && destination.images.length > 0 && destination.images[0]) {
            const path = destination.images[0].image_path;
            if (path.startsWith('http')) return path;
            // Si es un asset local (ej: seed data)
            if (path.startsWith('assets/') || path.startsWith('/assets/')) {
                return path.startsWith('/') ? path : `/${path}`;
            }
            // Si es storage backend
            return `${STORAGE_URL}/${path}`;
        }
        return 'https://via.placeholder.com/400x300?text=No+Image'; // Imagen por defecto
    };

    const categoryName = destination.category?.name || 'General';

    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-xl hover:-translate-y-2 group h-full flex flex-col ${isHighlighted ? 'ring-2 ring-eco-accent-400 shadow-2xl scale-105' : ''
                }`}
        >
            <div className="relative h-56 overflow-hidden">
                <img
                    src={getImageUrl()}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/30 to-transparent"></div>
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${getCategoryColor(categoryName)}`}>
                        {categoryName}
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="mb-4 flex-grow">
                    <h3 className="text-xl font-bold text-eco-primary-900 mb-2 font-display leading-tight group-hover:text-eco-primary-600 transition-colors">
                        {destination.name}
                    </h3>

                    <p className="text-eco-text-light text-sm line-clamp-2 leading-relaxed">
                        {destination.short_description}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-eco-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{(destination as any).duration || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-eco-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="capitalize">{(destination as any).difficulty || 'N/A'}</span>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/place/${destination.slug || destination.id}`;
                    }}
                    className="w-full bg-gradient-to-r from-eco-primary-600 to-eco-primary-700 hover:from-eco-primary-700 hover:to-eco-primary-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <span>Ver Detalles</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DestinationCard;
