import React, { useEffect, useState } from 'react';
import { placesService } from '../../services/placesService';

interface Review {
    id: number;
    rating: number;
    comment: string;
    raw_comment?: string;
    is_hidden: boolean;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    place: {
        id: number;
        name: string;
        slug: string;
    };
}

const AdminReviewsTable: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<number | null>(null);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data = await placesService.getAllReviews();
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error loading reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleHide = async (id: number) => {
        setToggling(id);
        try {
            const response = await placesService.toggleHideReview(id);
            setReviews(prev =>
                prev.map(r => (r.id === id ? { ...r, is_hidden: response.review.is_hidden } : r))
            );
        } catch (error) {
            console.error('Error toggling review visibility:', error);
            alert('Error al cambiar visibilidad del comentario');
        } finally {
            setToggling(null);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <svg
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-400">Cargando reseñas...</div>;
    }

    return (
        <div className="overflow-x-auto">
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                        <tr>
                            <th className="p-4 border-b">Lugar</th>
                            <th className="p-4 border-b">Usuario</th>
                            <th className="p-4 border-b">Calificación</th>
                            <th className="p-4 border-b">Comentario</th>
                            <th className="p-4 border-b">Estado</th>
                            <th className="p-4 border-b text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {reviews.map(review => (
                            <tr key={review.id} className={`hover:bg-gray-50 transition-colors ${review.is_hidden ? 'bg-red-50/50' : ''}`}>
                                <td className="p-4">
                                    <p className="font-medium text-gray-900 truncate max-w-[150px]" title={review.place?.name}>
                                        {review.place?.name || 'Lugar eliminado'}
                                    </p>
                                </td>
                                <td className="p-4">
                                    <div>
                                        <p className="font-medium text-gray-900">{review.user?.name}</p>
                                        <p className="text-xs text-gray-500">{review.user?.email}</p>
                                    </div>
                                </td>
                                <td className="p-4">{renderStars(review.rating)}</td>
                                <td className="p-4 max-w-[200px]">
                                    <p className={`text-sm truncate ${review.is_hidden ? 'text-gray-400 line-through' : 'text-gray-700'}`} title={review.raw_comment || review.comment}>
                                        {(review.raw_comment || review.comment) || <span className="italic text-gray-400">Sin comentario</span>}
                                    </p>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${review.is_hidden ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {review.is_hidden ? 'Oculto' : 'Visible'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleToggleHide(review.id)}
                                        disabled={toggling === review.id}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${review.is_hidden
                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                            }`}
                                    >
                                        {toggling === review.id ? (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                ...
                                            </span>
                                        ) : review.is_hidden ? (
                                            <>
                                                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Mostrar
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                                Ocultar
                                            </>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {reviews.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No hay reseñas para moderar.</div>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4">
                {reviews.map(review => (
                    <div key={review.id} className={`p-4 rounded-xl shadow-sm border ${review.is_hidden ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-gray-900">{review.place?.name || 'Lugar eliminado'}</p>
                                <p className="text-xs text-gray-500">{review.user?.name}</p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${review.is_hidden ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {review.is_hidden ? 'Oculto' : 'Visible'}
                            </span>
                        </div>

                        <div className="mb-2">{renderStars(review.rating)}</div>

                        <p className={`text-sm mb-3 ${review.is_hidden ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                            {review.raw_comment || review.comment || <span className="italic text-gray-400">Sin comentario</span>}
                        </p>

                        <div className="flex justify-end pt-2 border-t border-gray-100">
                            <button
                                onClick={() => handleToggleHide(review.id)}
                                disabled={toggling === review.id}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 ${review.is_hidden
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-red-100 text-red-700'
                                    }`}
                            >
                                {toggling === review.id ? '...' : review.is_hidden ? 'Mostrar Comentario' : 'Ocultar Comentario'}
                            </button>
                        </div>
                    </div>
                ))}
                {reviews.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No hay reseñas para moderar.</div>
                )}
            </div>
        </div>
    );
};

export default AdminReviewsTable;
