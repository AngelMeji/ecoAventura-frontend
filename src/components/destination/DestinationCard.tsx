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
            'Naturaleza': 'bg-eco-primary-100 text-eco-primary-800',
            'Aventura': 'bg-eco-accent/20 text-yellow-800',
            'Cascadas': 'bg-blue-100 text-blue-800',
            'Termal': 'bg-orange-100 text-orange-800',
            'Fauna': 'bg-eco-secondary-light text-eco-secondary-hover',
            'Senderismo': 'bg-eco-primary-50 text-eco-primary-700',
        };
        return colors[categoryName] || 'bg-gray-100 text-gray-800';
    };

    // Helper para obtener URL de imagen (Backend V2 compatible)
    const getImageUrl = () => {
        // DEBUG: Ver estructura completa del destino
        console.log('🏞️ Full destination object for', destination.name, ':', destination);

        // DEBUG: Ver estructura de datos de imágenes
        if (destination.images && destination.images.length > 0) {
            console.log('🖼️ Image data for', destination.name, ':', destination.images[0]);
        } else {
            console.log('❌ No images array or empty for:', destination.name);
        }

        if (destination.images && destination.images.length > 0 && destination.images[0]) {
            const firstImage = destination.images[0];

            // PRIORIDAD 1: full_url del backend V2
            if (firstImage.full_url) {
                console.log('✅ Using full_url:', firstImage.full_url);
                return firstImage.full_url;
            }

            // PRIORIDAD 2: Construir URL manualmente
            const path = firstImage.image_path;
            console.log('⚠️ No full_url, constructing from image_path:', path);

            if (path.startsWith('http')) return path;

            // Si es un asset local (ej: seed data)
            if (path.startsWith('assets/') || path.startsWith('/assets/')) {
                return path.startsWith('/') ? path : `/${path}`;
            }

            // Si es storage backend
            const constructedUrl = `${STORAGE_URL}/${path}`;
            console.log('🔧 Constructed URL:', constructedUrl);
            return constructedUrl;
        }
        console.log('❌ No images found for:', destination.name);
        return '/assets/images/placeholder.jpg'; // Cambiar a ruta local
    };

    const categoryName = destination.category?.name || 'General';

    return (
        <div
            onClick={onClick}
            className={`group bg-white rounded-3xl shadow-lg shadow-eco-primary-900/5 overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-eco-primary-900/10 hover:-translate-y-2 flex flex-col h-full ${isHighlighted ? 'ring-4 ring-eco-accent shadow-2xl scale-105' : 'hover:ring-2 hover:ring-eco-primary-100/50'
                }`}
        >
            <div className="relative h-56 shrink-0 overflow-hidden">
                <img
                    src={getImageUrl()}
                    alt={destination.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-sm ${getCategoryColor(categoryName)}`}>
                        {categoryName}
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-display font-bold text-gray-800 mb-2 group-hover:text-eco-primary-700 transition-colors line-clamp-1">
                    {destination.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2 font-light leading-relaxed flex-grow">
                    {destination.short_description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                        <div className="p-1.5 bg-eco-primary-50 rounded-lg text-eco-primary-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="font-medium">{(destination as any).duration || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700">
                        <div className="p-1.5 bg-eco-secondary-light/30 rounded-lg text-eco-secondary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="font-medium capitalize">{(destination as any).difficulty || 'N/A'}</span>
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/place/${destination.slug || destination.id}`;
                    }}
                    className="w-full bg-eco-primary-600 hover:bg-eco-primary-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 group-hover:bg-eco-primary-700"
                >
                    <span>Explorar Destino</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DestinationCard;
