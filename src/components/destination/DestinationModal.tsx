import React, { useState, useEffect } from 'react';
import type { Place } from '../../models/Place.model';
import { authService } from '../../services/authService';
import { placesService } from '../../services/placesService';

// URL base para las imágenes (storage)
const STORAGE_URL = import.meta.env.VITE_API_URL?.replace('/api', '/storage') || 'http://localhost:8000/storage';

interface DestinationModalProps {
    destination: Place;
    isOpen: boolean;
    onClose: () => void;
}

const DestinationModal: React.FC<DestinationModalProps> = ({
    destination: initialDestination,
    isOpen,
    onClose
}) => {
    const [destination, setDestination] = useState<Place>(initialDestination);
    const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const user = authService.getCurrentUser();

    // Sincronizar estado local cuando cambia la prop inicial o se abre el modal
    useEffect(() => {
        if (isOpen) {
            setDestination(initialDestination);
            setMessage(null);
            setRating(0);
            setComment('');
            setActiveTab('info');
        }
    }, [initialDestination, isOpen]);

    if (!isOpen) return null;

    // Obtener imágenes o usar placeholder si no hay
    const images = destination.images && destination.images.length > 0
        ? destination.images
        : [{ id: 0, image_path: '/assets/images/placeholder.jpg' }]; // Usar placeholder local o ruta válida

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

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validación básica en frontend
        if (rating === 0) {
            setMessage({ type: 'error', text: 'Por favor selecciona una calificación' });
            return;
        }

        setSubmitting(true);
        try {
            // Importar el servicio dinámicamente
            const { placesService } = await import('../../services/placesService');

            // Llamada al servicio para crear la reseña
            await placesService.createReview(destination.id, { rating, comment });

            // Éxito: Limpiar formulario y notificar
            setMessage({ type: 'success', text: '¡Reseña enviada con éxito!' });
            setComment('');
            setRating(0);

            // Actualizar los datos del lugar localmente para mostrar la nueva reseña
            const updated: any = await placesService.getOne(destination.id);
            const loadedPlace = updated.data || updated;
            setDestination(loadedPlace);

        } catch (error: any) {
            console.error('Error enviando reseña:', error);

            // Manejo de errores 422 (Validación de Laravel)
            if (error.response && error.response.status === 422) {
                const data = error.response.data;
                const validationErrors = data.errors;
                let msgText = '';

                if (validationErrors) {
                    msgText = Object.values(validationErrors).flat().join('\n');
                } else {
                    msgText = data.message || 'Error de validación';
                }
                setMessage({ type: 'error', text: msgText });
            } else {
                setMessage({ type: 'error', text: error.message || 'Ocurrió un error al enviar la reseña.' });
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) {
            setMessage({ type: 'error', text: 'Debes iniciar sesión para guardar favoritos' });
            return;
        }

        try {
            if (destination.is_favorite) {
                await placesService.removeFavorite(destination.id);
                setDestination({ ...destination, is_favorite: false });
            } else {
                await placesService.addFavorite(destination.id);
                setDestination({ ...destination, is_favorite: true });
            }
        } catch (error) {
            console.error('Error toggling favorite', error);
        }
    };

    const categoryName = destination.category?.name || 'General';
    const currentRating = destination.average_rating || 0;
    const reviewCount = destination.reviews?.length || 0;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">

                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-eco-primary-700">{destination.name}</h2>
                    <div className="flex items-center gap-2">
                        {user && (
                            <button
                                onClick={handleToggleFavorite}
                                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${destination.is_favorite
                                    ? 'text-red-500 bg-red-50'
                                    : 'text-gray-400 hover:text-red-400 hover:bg-gray-100'
                                    }`}
                                title={destination.is_favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                            >
                                <svg className="w-6 h-6" fill={destination.is_favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        )}
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
                <div className="flex p-2 gap-2 bg-gray-50 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${activeTab === 'info'
                            ? 'bg-eco-primary-100 text-eco-primary-800 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <span className="flex items-center justify-center gap-2">
                            Info
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`flex-1 py-2 px-4 rounded-full text-sm font-medium transition-all ${activeTab === 'reviews'
                            ? 'bg-eco-primary-100 text-eco-primary-800 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-100'
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
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20"
                                        >
                                            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20"
                                        >
                                            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex flex-wrap gap-3">
                                <span className="px-3 py-1 bg-eco-primary-100 text-eco-primary-800 rounded-full text-sm font-medium">
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
                                <h3 className="text-xl font-bold text-eco-primary-700 mb-2">Descripción</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {destination.description}
                                </p>
                            </div>

                            {/* Location */}
                            <div className="bg-eco-primary-50 rounded-xl p-4 border border-eco-primary-100">
                                <h4 className="font-bold text-eco-primary-800">Ubicación</h4>
                                <p className="text-gray-600 text-sm mt-1">{destination.address}</p>
                                <p className="text-gray-500 text-xs mt-1 font-mono">
                                    Coordenadas: {destination.latitude}, {destination.longitude}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Rating Summary */}
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold text-gray-800">{currentRating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1">{reviewCount} reseñas</p>
                                </div>
                            </div>

                            {/* Write Review Form */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                {user ? (
                                    <form onSubmit={handleSubmitReview} className="space-y-4">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                            <h4 className="font-bold text-gray-800">Escribe una Reseña</h4>
                                            <div className="flex items-center gap-1 bg-white px-4 py-2 rounded-full border border-gray-200">
                                                <span className="text-sm text-gray-500 mr-2">Calificación:</span>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => handleRating(star)}
                                                        className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {message && (
                                            <div className={`p-4 rounded-xl mb-4 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                                }`}>
                                                {message.type === 'success' ? (
                                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                ) : (
                                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                )}
                                                <p className="whitespace-pre-line text-sm">{message.text}</p>
                                            </div>
                                        )}

                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Comparte tu experiencia..."
                                            className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-eco-primary-400 focus:border-eco-primary-400 outline-none transition-all resize-y min-h-[100px]"
                                            rows={3}
                                        />

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={rating === 0 || submitting}
                                                className="bg-eco-primary-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-eco-primary-700 transition-all transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {submitting ? 'Enviando...' : 'Publicar Reseña'}
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="flex items-center gap-4 bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-yellow-800">
                                        <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
                                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        </div>
                                        <p className="font-medium text-sm">Inicia sesión para compartir tu experiencia.</p>
                                    </div>
                                )}
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-6">
                                <h4 className="text-xl font-bold text-gray-800 border-b border-gray-100 pb-4">
                                    Opiniones de otros viajeros ({destination.reviews?.length || 0})
                                </h4>

                                {destination.reviews && destination.reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {destination.reviews.map((rev: any, idx: number) => (
                                            <div key={idx} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:border-gray-200 transition-all">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-eco-primary-100 flex items-center justify-center text-eco-primary-700 font-bold">
                                                            {(rev.user?.name || 'U')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm">{rev.user?.name || 'Anónimo'}</p>
                                                            <div className="flex text-yellow-400 text-xs">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className={`text-sm leading-relaxed ${rev.is_hidden ? 'italic text-gray-400' : 'text-gray-600'}`}>
                                                    {rev.is_hidden ? 'Este comentario ha sido ocultado por moderación.' : rev.comment}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <p className="text-gray-500 italic text-sm">Aún no hay reseñas. ¡Sé el primero!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DestinationModal;
