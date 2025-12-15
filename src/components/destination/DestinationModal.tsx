import React, { useState } from 'react';
import type { Place } from '../../models/Place.model';

// URL base para las imágenes (storage)
const STORAGE_URL = import.meta.env.VITE_API_URL?.replace('/api', '/storage') || 'http://localhost:8000/storage';

interface DestinationModalProps {
    destination: Place;
    isOpen: boolean;
    onClose: () => void;
}

const DestinationModal: React.FC<DestinationModalProps> = ({
    destination,
    isOpen,
    onClose
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    // Obtener imágenes o usar placeholder si no hay
    const images = destination.images && destination.images.length > 0
        ? destination.images
        : [{ id: 0, image_path: 'https://via.placeholder.com/800x600?text=No+Image' }];

    const getFullImageUrl = (path: string) => {
        if (path.startsWith('http')) return path;
        return `${STORAGE_URL}/${path}`;
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? images.length - 1 : prev - 1
        );
    };

    const handleRating = (value: number) => {
        setRating(value);
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implementar envío de reseñas al backend
        console.log({ rating, comment, place_id: destination.id });
        setComment('');
        setRating(0);
        alert('¡Reseña enviada! (Funcionalidad completa pendiente de integración)');
    };

    const categoryName = destination.category?.name || 'General';
    const currentRating = destination.average_rating || 0;
    const reviewCount = destination.reviews?.length || 0;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-eco-teal-700">{destination.name}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-yellow-50/50">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${activeTab === 'info'
                            ? 'bg-yellow-100 text-yellow-800 shadow-sm'
                            : 'text-gray-600 hover:bg-yellow-50'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            Info
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${activeTab === 'reviews'
                            ? 'bg-yellow-100 text-yellow-800 shadow-sm'
                            : 'text-gray-600 hover:bg-yellow-50'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            Reseñas
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'info' ? (
                        <div className="space-y-6">
                            {/* Carousel */}
                            <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden group">
                                <img
                                    src={images[currentImageIndex] ? getFullImageUrl(images[currentImageIndex].image_path) : 'https://via.placeholder.com/800x600?text=No+Image'}
                                    alt={`${destination.name}`}
                                    className="w-full h-full object-cover transition-transform duration-500"
                                />

                                {/* Carousel Controls */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            ←
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            →
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1 bg-eco-teal-100 text-eco-teal-800 rounded-full text-sm font-medium">
                                    {categoryName}
                                </span>
                                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium capitalize">
                                    {destination.difficulty || 'Dificultad N/A'}
                                </span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    {destination.duration || 'Duración N/A'}
                                </span>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                                    {destination.best_season || 'Mejor temporada N/A'}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-eco-teal-700 mb-2">Descripción</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {destination.description}
                                </p>
                            </div>

                            {/* Location */}
                            <div className="bg-eco-teal-50 rounded-xl p-4 border border-eco-teal-100">
                                <h4 className="font-bold text-eco-teal-800">Ubicación</h4>
                                <p className="text-gray-600 text-sm mt-1">{destination.address}</p>
                                <p className="text-gray-500 text-xs mt-1 font-mono">
                                    Coordenadas: {destination.latitude}, {destination.longitude}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Rating Summary */}
                            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-100 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold text-gray-800">{currentRating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">{reviewCount} reseñas</p>
                                </div>
                            </div>

                            {/* Write Review Form */}
                            <div className="border border-gray-200 rounded-xl p-6">
                                <h4 className="font-bold text-gray-800 mb-4">Escribe una Reseña</h4>
                                <form onSubmit={handleSubmitReview}>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => handleRating(star)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <span className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-4">
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Comparte tu experiencia..."
                                            className="w-full p-3 border border-gray-300 rounded-lg"
                                            rows={4}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={rating === 0 || !comment.trim()}
                                        className="bg-eco-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-eco-teal-600 disabled:opacity-50"
                                    >
                                        Publicar Reseña
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DestinationModal;
