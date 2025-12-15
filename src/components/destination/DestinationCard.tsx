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
            'Naturaleza': 'bg-green-100 text-green-800',
            'Aventura': 'bg-orange-100 text-orange-800',
            'Cascadas': 'bg-blue-100 text-blue-800',
            'Termal': 'bg-red-100 text-red-800',
            'Fauna': 'bg-purple-100 text-purple-800',
            'Senderismo': 'bg-yellow-100 text-yellow-800',
        };
        return colors[categoryName] || 'bg-gray-100 text-gray-800';
    };

    // Helper para obtener URL de imagen
    const getImageUrl = () => {
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
            className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${isHighlighted ? 'ring-4 ring-eco-teal-500 shadow-2xl' : ''
                }`}
        >
            <div className="relative h-48 overflow-hidden">
                <img
                    src={getImageUrl()}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(categoryName)}`}>
                        {categoryName}
                    </span>
                </div>
            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {destination.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {destination.short_description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-eco-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-700">{(destination as any).duration || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-eco-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-gray-700 capitalize">{(destination as any).difficulty || 'N/A'}</span>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/place/${destination.slug || destination.id}`;
                    }}
                    className="w-full bg-eco-teal-500 hover:bg-eco-teal-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                    Ver más detalles
                </button>
            </div>
        </div>
    );
};

export default DestinationCard;
