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

    // Estado para manejar errores de validación específicos del backend
    const [errors, setErrors] = useState<string[]>([]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]); // Limpiar errores previos

        // Validación básica en frontend
        if (rating === 0) {
            alert('Por favor selecciona una calificación');
            return;
        }

        try {
            // Importar el servicio dinámicamente
            const { placesService } = await import('../../services/placesService');

            // Llamada al servicio para crear la reseña
            const newReview = await placesService.createReview(destination.id, { rating, comment });

            // Éxito: Limpiar formulario y notificar
            alert('¡Reseña enviada con éxito!');
            setComment('');
            setRating(0);

            // INTENTO DE ACTUALIZAR LA UI:
            // Como las props son inmutables, podemos intentar cerrar el modal para forzar refresco en la vista padre
            // o (idealmente) usar una función de callback si existiera.
            // Por ahora, notificamos al usuario.
            // Si el backend devuelve la nueva reseña, podríamos mostrarla localmente, 
            // pero la estructura de `destination.reviews` viene de props.

            // Opcional: Recargar la página si estamos en una vista que depende de esto
            console.log('Review created:', newReview);

            // CERRAR MODAL para que el usuario vea el cambio si la vista padre se actualiza (o para que al reabrir cargue de nuevo)
            // onClose(); 
            // O podemos intentar recargar los datos del lugar

            // FORCE RELOAD workaround (since we don't have a callback prop yet)
            window.location.reload();

        } catch (error: any) {
            console.error('Error enviando reseña:', error);

            // Manejo de errores 422 (Validación de Laravel)
            if (error.response && error.response.status === 422) {
                console.log('DATA 422:', error.response.data);
                const data = error.response.data;
                const validationErrors = data.errors;
                const errorMessages: string[] = [];

                // Extraer mensajes de error del objeto de respuesta
                if (validationErrors) {
                    Object.values(validationErrors).forEach((errArray: any) => {
                        errorMessages.push(...errArray);
                    });
                } else if (data.message) {
                    errorMessages.push(data.message);
                }

                setErrors(errorMessages.length > 0 ? errorMessages : ['Error de validación desconocido.']);
            } else {
                // Otros errores (500, red, etc.)
                alert(error.message || 'Ocurrió un error al enviar la reseña. Inténtalo de nuevo.');
            }
        }
    };

    const categoryName = destination.category?.name || 'General';
    const currentRating = destination.average_rating || 0;
    const reviewCount = destination.reviews?.length || 0;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-eco-primary-700">{destination.name}</h2>
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
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
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
                                                    <svg className={`w-8 h-8 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
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
                                    {/* Mostrar errores de validación si existen */}
                                    {errors.length > 0 && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                            <p className="font-bold text-red-700 text-sm mb-1">No se pudo enviar la reseña:</p>
                                            <ul className="list-disc list-inside text-sm text-red-600">
                                                {errors.map((err, idx) => (
                                                    <li key={idx}>{err}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={rating === 0 || !comment.trim()}
                                        className="bg-eco-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-eco-primary-700 disabled:opacity-50"
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
