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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-eco-primary-900/60 backdrop-blur-md transition-opacity duration-300">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-fade-in-up border border-white/20">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <h2 className="text-3xl font-bold text-eco-primary-900 font-display">{destination.name}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-eco-primary-600 transition-colors rounded-full hover:bg-eco-primary-50"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-gray-50/80 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 py-3 px-6 rounded-2xl text-sm font-semibold transition-all duration-300 ${activeTab === 'info'
                            ? 'bg-white text-eco-primary-700 shadow-sm ring-1 ring-gray-200'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            ℹ️ Información
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`flex-1 py-3 px-6 rounded-2xl text-sm font-semibold transition-all duration-300 ${activeTab === 'reviews'
                            ? 'bg-white text-eco-primary-700 shadow-sm ring-1 ring-gray-200'
                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            ⭐ Reseñas
                        </span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-eco-bg/30">
                    {activeTab === 'info' ? (
                        <div className="space-y-8">
                            {/* Carousel */}
                            <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden group shadow-lg">
                                <img
                                    src={images[currentImageIndex] ? getFullImageUrl(images[currentImageIndex].image_path) : 'https://via.placeholder.com/800x600?text=No+Image'}
                                    alt={`${destination.name}`}
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />

                                {/* Carousel Controls */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImage}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-eco-primary-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 backdrop-blur-sm"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-eco-primary-800 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 backdrop-blur-sm"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </>
                                )}
                                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-medium">
                                    {currentImageIndex + 1} / {images.length}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex flex-wrap gap-3">
                                <span className="px-4 py-1.5 bg-eco-primary-50 text-eco-primary-700 border border-eco-primary-100 rounded-full text-sm font-semibold shadow-sm">
                                    {categoryName}
                                </span>
                                <span className="px-4 py-1.5 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-sm font-medium capitalize shadow-sm">
                                    {destination.difficulty || 'Dificultad N/A'}
                                </span>
                                <span className="px-4 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-sm font-medium shadow-sm">
                                    {destination.duration || 'Duración N/A'}
                                </span>
                                <span className="px-4 py-1.5 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-full text-sm font-medium shadow-sm">
                                    {destination.best_season || 'Mejor temporada N/A'}
                                </span>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-2xl font-bold text-eco-primary-800 mb-4 font-display">Sobre este lugar</h3>
                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {destination.description}
                                </p>
                            </div>

                            {/* Location */}
                            <div className="bg-eco-primary-50 rounded-2xl p-6 border border-eco-primary-100 flex items-start gap-4">
                                <span className="text-3xl">📍</span>
                                <div>
                                    <h4 className="font-bold text-eco-primary-900 text-lg">Ubicación</h4>
                                    <p className="text-eco-primary-700 mt-1">{destination.address}</p>
                                    <p className="text-eco-primary-600/70 text-sm mt-2 font-mono bg-white/50 inline-block px-2 py-1 rounded">
                                        {destination.latitude}, {destination.longitude}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Rating Summary */}
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-100 flex items-center justify-between shadow-sm">
                                <div>
                                    <h4 className="text-xl font-bold text-yellow-900 mb-2">Puntuación General</h4>
                                    <div className="flex items-center gap-3">
                                        <span className="text-5xl font-bold text-yellow-500 font-display">{currentRating.toFixed(1)}</span>
                                        <div className="flex flex-col">
                                            <div className="flex text-yellow-400 text-xl">{'★'.repeat(Math.round(currentRating))}{'☆'.repeat(5 - Math.round(currentRating))}</div>
                                            <span className="text-yellow-700/70 text-sm font-medium">{reviewCount} reseñas verificadas</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Write Review Form */}
                            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm ring-1 ring-gray-100">
                                <h4 className="font-bold text-gray-800 mb-6 text-xl">Comparte tu experiencia</h4>
                                <form onSubmit={handleSubmitReview}>
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Calificación</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => handleRating(star)}
                                                    className="focus:outline-none transition-all hover:scale-110 active:scale-95 group"
                                                >
                                                    <span className={`text-3xl transition-colors ${star <= rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200 group-hover:text-yellow-200'}`}>★</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="mb-6">
                                        <label className="block text-sm font-semibold text-gray-700 mb-3">Tu comentario</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Cuéntanos qué fue lo que más te gustó..."
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-eco-primary-200 focus:border-eco-primary-400 outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                                            rows={4}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={rating === 0 || !comment.trim()}
                                        className="w-full bg-gradient-to-r from-eco-primary-600 to-eco-primary-700 text-white px-8 py-3 rounded-xl font-bold hover:from-eco-primary-700 hover:to-eco-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform active:scale-95"
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
