import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { placesService } from '../services/placesService';
import type { Place } from '../models/Place.model';
import Header from '../components/layout/Header';
import { authService } from '../services/authService';

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
            // Handle Laravel Resource response wrapping
            setPlace(data.data || data);
        } catch (error) {
            console.error('Error loading place:', error);
            // navigate('/home'); // Optional: redirect on error
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
            console.error('Error sending review:', error);
            alert(error.message || 'Error al enviar reseña. Verificaste backend?');
        }
    };

    const getFullImageUrl = (path: string) => {
        if (!path) return 'https://via.placeholder.com/800x600?text=No+Image';
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eco-teal-500"></div>
            </div>
        );
    }

    if (!place) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="text-6xl mb-4">🏞️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Lugar no encontrado</h2>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                    Es posible que el lugar que buscas haya sido eliminado o no esté disponible actualmente.
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={() => navigate('/home')}
                        className="bg-eco-teal-600 text-white px-6 py-2 rounded-lg hover:bg-eco-teal-700 font-bold"
                    >
                        Ir al Mapa
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-white border text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-bold"
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
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="mb-4 text-gray-600 hover:text-eco-teal-600 flex items-center">
                    ← Volver
                </button>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header Image / Carousel */}
                    <div className="relative h-64 md:h-96 bg-gray-200">
                        <img
                            src={getFullImageUrl(images[currentImageIndex].image_path)}
                            alt={place.name}
                            className="w-full h-full object-cover"
                        />
                        {images.length > 1 && (
                            <div className="absolute inset-0 flex items-center justify-between p-4">
                                <button onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)} className="bg-white/50 p-2 rounded-full hover:bg-white text-gray-800">←</button>
                                <button onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)} className="bg-white/50 p-2 rounded-full hover:bg-white text-gray-800">→</button>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!place) return;
                                    try {
                                        if (place.is_favorite) {
                                            await placesService.removeFavorite(place.id);
                                            setPlace({ ...place, is_favorite: false });
                                            alert('Eliminado de favoritos');
                                        } else {
                                            await placesService.addFavorite(place.id);
                                            setPlace({ ...place, is_favorite: true });
                                            alert('Añadido a favoritos');
                                        }
                                    } catch (error) {
                                        console.error('Error toggling favorite', error);
                                        alert('Error al actualizar favoritos');
                                    }
                                }}
                                className={`p-3 rounded-full shadow-lg transition-transform hover:scale-110 ${place.is_favorite ? 'bg-red-500 text-white' : 'bg-white text-gray-400'}`}
                            >
                                <svg className="w-6 h-6" fill={place.is_favorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white">
                            <h1 className="text-4xl font-bold">{place.name}</h1>
                            <p className="mt-2 text-lg opacity-90">{place.category?.name} • {place.address}</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 flex">
                        <button
                            className={`flex-1 py-4 text-center font-medium ${activeTab === 'info' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('info')}
                        >
                            Información
                        </button>
                        <button
                            className={`flex-1 py-4 text-center font-medium ${activeTab === 'reviews' ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Reseñas ({place.reviews?.length || 0})
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'info' && (
                            <div className="space-y-6">
                                <p className="text-gray-700 text-lg leading-relaxed">{place.description}</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <h3 className="font-bold text-gray-900">Dificultad</h3>
                                        <p className="text-teal-600 capitalize font-medium">{place.difficulty || 'No especificada'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <h3 className="font-bold text-gray-900">Duración</h3>
                                        <p className="text-teal-600 font-medium">{place.duration || 'No especificada'}</p>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <h3 className="font-bold text-gray-900">Mejor Temporada</h3>
                                        <p className="text-teal-600 font-medium">{place.best_season || 'Todas'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div>
                                {user ? (
                                    <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                                        <h3 className="font-bold mb-4 text-gray-800">Escribe tu reseña</h3>
                                        <div className="flex items-center gap-2 mb-4">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button type="button" key={star} onClick={() => setRating(star)} className={`text-2xl transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                                            ))}
                                        </div>
                                        <textarea
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
                                            placeholder="Tu opinión..."
                                            required
                                        ></textarea>
                                        <button type="submit" disabled={rating === 0} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 font-bold shadow-md">Publicar</button>
                                    </form>
                                ) : (
                                    <div className="bg-yellow-50 p-4 rounded-lg mb-8 text-yellow-800 border border-yellow-200">Inicia sesión para escribir una reseña.</div>
                                )}

                                <div className="space-y-4">
                                    {place.reviews && place.reviews.length > 0 ? (
                                        place.reviews.map((rev: any, idx: number) => (
                                            <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 relative">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-gray-800">{rev.user?.name || 'Usuario'}</span>
                                                    <div className="flex text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600">{rev.comment}</p>
                                                <div className="flex gap-2 mt-2">
                                                    {(user?.role === 'admin' || user?.id === rev.user_id) && (
                                                        <>
                                                            <button
                                                                onClick={async () => {
                                                                    if (confirm('¿Eliminar esta reseña?')) {
                                                                        try {
                                                                            await placesService.deleteReview(rev.id);
                                                                            setPlace(prev => prev ? {
                                                                                ...prev,
                                                                                reviews: prev.reviews?.filter(r => r.id !== rev.id)
                                                                            } : null);
                                                                            alert('Reseña eliminada');
                                                                        } catch (e) {
                                                                            alert('Error eliminando reseña');
                                                                        }
                                                                    }
                                                                }}
                                                                className="text-xs text-red-500 hover:text-red-700 font-bold"
                                                            >
                                                                Eliminar
                                                            </button>
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
                                                                                .catch(() => alert('Error actualizando (Backend support required)'));
                                                                        }
                                                                    }}
                                                                    className="text-xs text-blue-500 hover:text-blue-700 font-bold"
                                                                >
                                                                    Editar
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">Aún no hay reseñas. ¡Sé el primero!</p>
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
