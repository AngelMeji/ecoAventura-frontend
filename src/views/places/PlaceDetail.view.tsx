import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { placesService } from '../../services/placesService';
import type { Place } from '../../models/Place.model';
import Header from '../../components/layout/Header';
import { authService } from '../../services/authService';

const STORAGE_URL = import.meta.env.VITE_API_URL?.replace('/api', '/storage') || 'http://localhost:8000/storage';

const PlaceDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [place, setPlace] = useState<Place | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'reviews'>('info');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Reviews state
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const user = authService.getCurrentUser();

    useEffect(() => {
        // If we have passed data from dashboard (e.g. pending place), use it to avoid 404
        const statePlace = location.state?.placeData;
        if (statePlace) {
            setPlace(statePlace);
            setLoading(false);
            // Optionally refresh in background if approved, but for pending we stick with state
            if (statePlace.status !== 'pending') {
                // loadPlace(statePlace.slug || statePlace.id); // Maybe refresh?
            }
        } else if (id) {
            loadPlace(id);
        }
    }, [id, location.state]);

    const loadPlace = async (placeId: string) => {
        try {
            setLoading(true);
            const data: any = await placesService.getOne(placeId);
            // Manejar respuesta envuelta de Laravel Resource (data.data)
            const loadedPlace = data.data || data;

            // VERIFICACIÓN MANUAL DE FAVORITO (Persistencia)
            // Si el backend no devuelve 'is_favorite', verificamos contra la lista de favoritos del usuario
            if (user && loadedPlace.is_favorite === undefined) {
                try {
                    const favsResponse: any = await placesService.getFavorites();
                    const rawList = Array.isArray(favsResponse)
                        ? favsResponse
                        : (favsResponse?.data ? favsResponse.data : []);

                    // Verificar si el ID del lugar está en la lista (como id directo o place_id)
                    const isFav = rawList.some((f: any) =>
                        (f.place_id && f.place_id === loadedPlace.id) ||
                        (f.id === loadedPlace.id)
                    );

                    // Forzar el estado en el objeto local
                    loadedPlace.is_favorite = isFav;
                    console.log(`Verificación manual favorrito para ${loadedPlace.id}: ${isFav}`);
                } catch (err) {
                    console.warn('Falló verificación manual de favoritos', err);
                }
            }

            setPlace(loadedPlace);
        } catch (error) {
            console.error('Error cargando lugar:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!place) return;
        if (rating === 0) {
            alert('Por favor selecciona una calificación');
            return;
        }
        try {
            await placesService.createReview(place.id, { rating, comment });
            alert('¡Reseña enviada con éxito!');
            setComment('');
            setRating(0);

            // Reload to see new review
            const updated = await placesService.getOne(place.id);
            // Handle wrapper
            const p = (updated as any).data || updated;
            setPlace(p);
            setActiveTab('reviews');
        } catch (error: any) {
            // Manejo específico para errores de validación (422)
            if (error.response && error.response.status === 422) {
                console.log('DATA 422:', error.response.data); // Para debugging
                const data = error.response.data;
                const validationErrors = data.errors;
                let message = data.message || 'Error de validación'; // Fallback al mensaje general

                if (validationErrors) {
                    message += ':\n';
                    // Concatenar todos los mensajes de error
                    Object.values(validationErrors).forEach((msgs: any) => {
                        message += `\n- ${msgs.join(', ')}`;
                    });
                }
                alert(message);
            } else {
                // Mensaje genérico para otros errores
                alert(error.message || 'Error al enviar reseña. Por favor intenta nuevamente.');
            }
        }
    };

    const getFullImageUrl = (path: string) => {
        if (!path) return '/assets/images/placeholder.jpg'; // Placeholder local seguro
        if (path.startsWith('http')) return path;
        // Si la ruta comienza con 'assets/', asumimos que es un recurso local del frontend
        if (path.startsWith('assets/') || path.startsWith('/assets/')) {
            return path.startsWith('/') ? path : `/${path}`;
        }
        // De lo contrario, es una imagen subida al backend (storage)
        return `${STORAGE_URL}/${path}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-eco-bg flex-col gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-eco-primary-600"></div>
                <p className="text-xl font-display text-eco-primary-800 animate-pulse">Cargando...</p>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-eco-bg p-4 text-center">
                <div className="text-6xl mb-4 opacity-50 text-eco-primary-300">
                    <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h2 className="text-3xl font-display font-bold text-eco-primary-900 mb-2">Lugar no encontrado</h2>
                <p className="text-eco-text-light mb-8 max-w-md mx-auto">
                    Es posible que el lugar que buscas haya sido eliminado o no esté disponible actualmente.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="auth-button shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                        Ir al Mapa
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-full border-2 border-eco-primary-200 text-eco-primary-700 font-semibold hover:bg-eco-primary-50 transition-colors"
                    >
                        Volver Atrás
                    </button>
                </div>
            </div>
        );
    }

    const images = place.images && place.images.length > 0
        ? place.images
        : [{ id: 0, image_path: 'https://via.placeholder.com/800x600?text=No+Image' }];

    return (
        <div className="min-h-screen bg-eco-bg pb-12">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-5xl">
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 text-eco-text-light hover:text-eco-primary-600 flex items-center gap-2 group transition-colors"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="font-medium">Volver</span>
                </button>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header Image / Carousel */}
                    <div className="relative h-[400px] md:h-[500px] bg-gray-200 group">
                        <img
                            src={getFullImageUrl(images[currentImageIndex].image_path)}
                            alt={place.name}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                        {images.length > 1 && (
                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                                    className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white transition-all transform hover:scale-110"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1); }}
                                    className="bg-white/20 hover:bg-white/40 backdrop-blur-md p-3 rounded-full text-white transition-all transform hover:scale-110"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}

                        <div className="absolute top-6 right-6 z-10">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!place) return;
                                    try {
                                        if (place.is_favorite) {
                                            await placesService.removeFavorite(place.id);
                                            setPlace({ ...place, is_favorite: false });
                                        } else {
                                            await placesService.addFavorite(place.id);
                                            setPlace({ ...place, is_favorite: true });
                                        }
                                    } catch (error) {
                                        console.error('Error toggling favorite', error);
                                    }
                                }}
                                className={`p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${place.is_favorite
                                    ? 'bg-white text-red-500 shadow-red-500/30'
                                    : 'bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-red-500'
                                    }`}
                            >
                                <svg className="w-6 h-6" fill={place.is_favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="px-3 py-1 bg-eco-primary-500/80 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider">
                                    {place.category?.name}
                                </span>
                                {(place.average_rating || 0) > 0 && (
                                    <div className="flex items-center gap-1 bg-yellow-400/90 backdrop-blur-sm text-black px-2 py-1 rounded-full text-xs font-bold">
                                        <span>★</span>
                                        <span>{place.average_rating}</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold font-display leading-tight mb-2">
                                {place.name}
                            </h1>
                            <div className="flex items-center gap-2 text-white/90 text-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                <p>{place.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="border-b border-gray-100 flex px-8 pt-4">
                        <button
                            className={`mr-8 pb-4 text-center font-medium transition-all relative ${activeTab === 'info'
                                ? 'text-eco-primary-700'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                            onClick={() => setActiveTab('info')}
                        >
                            Información
                            {activeTab === 'info' && (
                                <span className="absolute bottom-0 left-0 w-full h-1 bg-eco-primary-600 rounded-t-full" />
                            )}
                        </button>
                        <button
                            className={`pb-4 text-center font-medium transition-all relative ${activeTab === 'reviews'
                                ? 'text-eco-primary-700'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reseñas <span className="ml-1 text-xs bg-gray-100 text-gray-500 py-0.5 px-2 rounded-full">{place.reviews?.length || 0}</span>
                            {activeTab === 'reviews' && (
                                <span className="absolute bottom-0 left-0 w-full h-1 bg-eco-primary-600 rounded-t-full" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-8 bg-white min-h-[300px]">
                        {activeTab === 'info' && (
                            <div className="animate-fade-in">
                                <p className="text-gray-600 text-lg leading-relaxed mb-10 whitespace-pre-line">
                                    {place.description}
                                </p>

                                <h3 className="text-2xl font-display font-bold text-eco-primary-900 mb-6">Detalles de la Experiencia</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-6 bg-eco-primary-50/50 rounded-2xl border border-eco-primary-100 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-eco-primary-100 rounded-full flex items-center justify-center text-eco-primary-600 mb-4">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">Dificultad</h3>
                                        <p className="text-eco-primary-700 capitalize font-medium">{place.difficulty || 'No especificada'}</p>
                                    </div>
                                    <div className="p-6 bg-eco-primary-50/50 rounded-2xl border border-eco-primary-100 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-eco-primary-100 rounded-full flex items-center justify-center text-eco-primary-600 mb-4">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">Duración</h3>
                                        <p className="text-eco-primary-700 font-medium">{place.duration || 'No especificada'}</p>
                                    </div>
                                    <div className="p-6 bg-eco-primary-50/50 rounded-2xl border border-eco-primary-100 hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 bg-eco-primary-100 rounded-full flex items-center justify-center text-eco-primary-600 mb-4">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">Mejor Temporada</h3>
                                        <p className="text-eco-primary-700 font-medium">{place.best_season || 'Todas'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="animate-fade-in space-y-8">
                                <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                                    {user ? (
                                        <form onSubmit={handleSubmitReview} className="space-y-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">Escribe tu opinión</h3>
                                                <div className="flex items-center gap-1 bg-white px-4 py-2 rounded-full border border-gray-200">
                                                    <span className="text-sm text-gray-500 mr-2">Calificación:</span>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            type="button"
                                                            key={star}
                                                            onClick={() => setRating(star)}
                                                            className={`text-2xl transition-transform hover:scale-125 focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <textarea
                                                value={comment}
                                                onChange={e => setComment(e.target.value)}
                                                className="w-full p-4 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-eco-primary-400 focus:border-eco-primary-400 outline-none transition-all resize-y min-h-[100px]"
                                                placeholder="¿Qué te pareció este lugar? Comparte tu experiencia..."
                                                required
                                            ></textarea>
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={rating === 0}
                                                    className="auth-button w-auto px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Publicar Reseña
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="flex items-center gap-4 bg-yellow-50 p-6 rounded-xl border border-yellow-100 text-yellow-800">
                                            <div className="bg-yellow-100 p-2 rounded-full flex-shrink-0">
                                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            </div>
                                            <p className="font-medium">Inicia sesión para compartir tu experiencia con otros viajeros.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <h3 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-4">
                                        Comentarios ({place.reviews?.length || 0})
                                    </h3>

                                    {place.reviews && place.reviews.length > 0 ? (
                                        place.reviews.map((rev: any, idx: number) => (
                                            <div key={idx} className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-eco-primary-100 to-eco-primary-200 flex items-center justify-center text-eco-primary-700 font-bold text-lg">
                                                            {(rev.user?.name || 'U')[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{rev.user?.name || 'Viajero'}</div>
                                                            <div className="flex text-yellow-400 text-sm">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {(user?.role === 'admin' || user?.id === rev.user_id) && (
                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {user?.id === rev.user_id && (
                                                                <button
                                                                    onClick={() => {
                                                                        const newComment = prompt('Editar tu comentario:', rev.comment);
                                                                        const newRating = Number(prompt('Calificación (1-5):', rev.rating));
                                                                        if (newComment !== null && newRating) {
                                                                            placesService.updateReview(rev.id, { comment: newComment, rating: newRating })
                                                                                .then(() => {
                                                                                    alert('Reseña actualizada');
                                                                                    loadPlace(place.id.toString());
                                                                                })
                                                                                .catch(() => alert('Error actualizando'));
                                                                        }
                                                                    }}
                                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                                                                    title="Editar"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm('¿Eliminar esta reseña?')) {
                                                                        try {
                                                                            await placesService.deleteReview(rev.id);
                                                                            setPlace(prev => prev ? {
                                                                                ...prev,
                                                                                reviews: prev.reviews?.filter(r => r.id !== rev.id)
                                                                            } : null);
                                                                        } catch (e) {
                                                                            alert('Error eliminando reseña');
                                                                        }
                                                                    }
                                                                }}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 leading-relaxed text-sm">{rev.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <p className="text-gray-500 italic">Aún no hay reseñas para este lugar.</p>
                                            <p className="text-eco-primary-600 font-medium mt-2">¡Sé el primero en compartir tu aventura!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlaceDetail;
