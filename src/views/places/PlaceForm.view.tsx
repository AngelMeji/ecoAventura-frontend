import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { placesService } from '../../services/placesService';
import type { Category } from '../../models/Place.model';
import Header from '../../components/layout/Header';
import { authService } from '../../services/authService';

const PlaceForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;
    const user = authService.getCurrentUser();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Form States
    const [name, setName] = useState('');
    const [shortDesc, setShortDesc] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [address, setAddress] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [difficulty, setDifficulty] = useState<string>('baja');
    const [duration, setDuration] = useState('');
    const [bestSeason, setBestSeason] = useState('');
    const [images, setImages] = useState<FileList | null>(null);

    useEffect(() => {
        if (!user || (user.role !== 'partner' && user.role !== 'admin')) {
            navigate('/dashboard'); // Only partners/admin can create
            return;
        }

        loadCategories();
        if (isEditing) {
            loadPlace(id!);
        }
    }, [id]);

    const loadCategories = async () => {
        try {
            const data = await placesService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories', error);
        }
    };

    const loadPlace = async (placeId: string) => {
        try {
            setLoading(true);
            const place = await placesService.getOne(placeId);
            setName(place.name);
            setShortDesc(place.short_description);
            setDescription(place.description);
            setCategoryId(place.category_id?.toString() || '');
            setAddress(place.address || '');
            setLatitude(place.latitude?.toString() || '');
            setLongitude(place.longitude?.toString() || '');
            setDifficulty(place.difficulty || 'baja');
            setDuration(place.duration || '');
            setBestSeason(place.best_season || '');
        } catch (error) {
            console.error('Error loading place', error);
            alert('Error cargando lugar');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('short_description', shortDesc);
        formData.append('description', description);
        formData.append('category_id', categoryId);
        if (address) formData.append('address', address);
        if (latitude) formData.append('latitude', latitude);
        if (longitude) formData.append('longitude', longitude);
        if (difficulty) formData.append('difficulty', difficulty);
        if (duration) formData.append('duration', duration);
        if (bestSeason) formData.append('best_season', bestSeason);

        // Explicitly handle images
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const file = images[i];
                // Append with filename to ensure correct processing
                formData.append('images[]', file, file.name);
            }
        }

        try {
            if (isEditing) {
                await placesService.update(parseInt(id!), formData);
                if (confirm('Lugar actualizado correctamente. ¿Volver al panel?')) {
                    navigate('/dashboard');
                }
            } else {
                await placesService.create(formData);
                if (confirm('Lugar creado correctamente y pendiente de aprobación. ¿Volver al panel?')) {
                    navigate('/dashboard');
                }
            }
        } catch (error: any) {
            console.error('Error saving place', error);
            const msg = error.response?.data?.message || error.message || 'Error desconocido';
            const errors = error.response?.data?.errors;
            let errorDetails = '';

            if (errors) {
                errorDetails = Object.values(errors).flat().join('\n');
            }

            alert(`Error al guardar:\n${msg}\n${errorDetails}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-eco-bg font-sans">
            <Header />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-eco-primary-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800 font-display">
                        {isEditing ? 'Editar Lugar' : 'Publicar Nuevo Lugar'}
                    </h1>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Lugar *</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white placeholder-gray-400"
                                    placeholder="Ej. Cascada Mágica del Bosque"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoría *</label>
                                <div className="relative">
                                    <select
                                        required
                                        value={categoryId}
                                        onChange={e => setCategoryId(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Dificultad</label>
                                <div className="relative">
                                    <select
                                        value={difficulty}
                                        onChange={e => setDifficulty(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                                    >
                                        <option value="baja">🟢 Baja</option>
                                        <option value="media">🟡 Media</option>
                                        <option value="alta">🟠 Alta</option>
                                        <option value="experto">🔴 Experto</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción Corta *</label>
                            <input
                                required
                                type="text"
                                value={shortDesc}
                                onChange={e => setShortDesc(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                placeholder="Resumen breve para tarjetas (máx 150 caracteres)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción Detallada</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={5}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white resize-y"
                                placeholder="Cuenta la historia completa del lugar, cómo llegar, qué esperar..."
                            ></textarea>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Duración Estimada</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={duration}
                                        onChange={e => setDuration(e.target.value)}
                                        className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Ej: 3 horas, 2 días..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mejor Temporada</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        value={bestSeason}
                                        onChange={e => setBestSeason(e.target.value)}
                                        className="w-full pl-10 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Ej: Verano, Todo el año..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 font-display flex items-center gap-2">
                                <svg className="w-6 h-6 text-eco-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Ubicación
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección / Referencia</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="Dirección exacta o referencia cercana"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Latitud</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={latitude}
                                        onChange={e => setLatitude(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="-12.0464"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Longitud</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={longitude}
                                        onChange={e => setLongitude(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        placeholder="-77.0428"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="border-t border-gray-100 pt-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 font-display flex items-center gap-2">
                                <svg className="w-6 h-6 text-eco-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Imágenes
                            </h3>
                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={e => setImages(e.target.files)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="space-y-1 text-center">
                                    <div className="mx-auto h-12 w-12 text-gray-400 group-hover:text-eco-primary-500 transition-colors">
                                        <svg className="w-12 h-12" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <div className="flex text-sm text-gray-600">
                                        <span className="relative cursor-pointer bg-white rounded-md font-medium text-eco-primary-600 hover:text-eco-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-eco-primary-500">
                                            <span>Sube imágenes</span>
                                        </span>
                                        <p className="pl-1">o arrastra y suelta</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, WEBP hasta 5MB
                                    </p>
                                    {images && images.length > 0 && (
                                        <div className="mt-4 p-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold">
                                            {images.length} archivos seleccionados
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-8 gap-4 border-t border-gray-100 mt-8">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-button w-auto px-8 shadow-lg shadow-eco-primary-500/20"
                            >
                                {loading ? 'Guardando...' : (isEditing ? 'Actualizar Lugar' : 'Publicar Lugar')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PlaceForm;
