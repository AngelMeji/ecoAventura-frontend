import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { placesService } from '../services/placesService';
import type { Category } from '../models/Place.model';
import Header from '../components/layout/Header';
import { authService } from '../services/authService';

const PlaceForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = !!id;
    const user = authService.getCurrentUser();

    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Estados de Formulario
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

    // Estado para errores de validación
    const [errors, setErrors] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (!user || (user.role !== 'partner' && user.role !== 'admin')) {
            navigate('/dashboard');
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
        setErrors({}); // Limpiar errores previos

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

        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const file = images[i];
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

            if (error.response?.status === 422) {
                // Errores de validación
                setErrors(error.response.data.errors || {});
                alert('Por favor corrige los errores señalados en el formulario.');
            } else {
                // Otros errores
                const msg = error.response?.data?.message || error.message || 'Error desconocido';
                alert(`Error al guardar: ${msg}`);
            }
        } finally {
            setLoading(false);
        }
    };

    // Helper para mostrar error de campo
    const ErrorMsg = ({ field }: { field: string }) => {
        if (!errors[field]) return null;
        return <p className="text-red-500 text-xs mt-1">{errors[field][0]}</p>;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 font-display">
                    {isEditing ? 'Editar Lugar' : 'Publicar Nuevo Lugar'}
                </h1>

                <div className="bg-white rounded-xl shadow-lg p-8 animate-fade-in-up">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Lugar *</label>
                                <input
                                    required
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className={`form-input w-full rounded-xl border-gray-200 p-3 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all ${errors.name ? 'border-red-300 bg-red-50' : ''}`}
                                />
                                <ErrorMsg field="name" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Categoría *</label>
                                <select
                                    required
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    className={`form-select w-full rounded-xl border-gray-200 p-3 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all ${errors.category_id ? 'border-red-300 bg-red-50' : ''}`}
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <ErrorMsg field="category_id" />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Dificultad</label>
                                <select
                                    value={difficulty}
                                    onChange={e => setDifficulty(e.target.value)}
                                    className="form-select w-full rounded-xl border-gray-200 p-3 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all"
                                >
                                    <option value="baja">Baja</option>
                                    <option value="media">Media</option>
                                    <option value="alta">Alta</option>
                                    <option value="experto">Experto</option>
                                </select>
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción Corta *</label>
                            <input
                                required
                                type="text"
                                value={shortDesc}
                                onChange={e => setShortDesc(e.target.value)}
                                className={`form-input w-full rounded-xl border-gray-200 p-3 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all ${errors.short_description ? 'border-red-300 bg-red-50' : ''}`}
                                placeholder="Resumen breve para tarjetas"
                            />
                            <ErrorMsg field="short_description" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción Detallada</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={5}
                                className={`form-textarea w-full rounded-xl border-gray-200 p-3 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all ${errors.description ? 'border-red-300 bg-red-50' : ''}`}
                            ></textarea>
                            <ErrorMsg field="description" />
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Duración Estimada</label>
                                <input
                                    type="text"
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    className="form-input w-full rounded-xl border-gray-200 p-3 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all"
                                    placeholder="Ej: 3 horas"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Mejor Temporada</label>
                                <input
                                    type="text"
                                    value={bestSeason}
                                    onChange={e => setBestSeason(e.target.value)}
                                    className="form-input w-full rounded-xl border-gray-200 p-3 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all"
                                    placeholder="Ej: Verano"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-eco-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Ubicación
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Dirección / Referencia</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        className={`form-input w-full rounded-xl border-gray-200 p-3 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all ${errors.address ? 'border-red-300 bg-red-50' : ''}`}
                                    />
                                    <ErrorMsg field="address" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Latitud</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={latitude}
                                        onChange={e => setLatitude(e.target.value)}
                                        className="form-input w-full rounded-xl border-gray-200 p-3 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Longitud</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={longitude}
                                        onChange={e => setLongitude(e.target.value)}
                                        className="form-input w-full rounded-xl border-gray-200 p-3 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-eco-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Imágenes
                            </h3>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={e => setImages(e.target.files)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="space-y-2 pointer-events-none">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <div className="flex text-sm text-gray-600 justify-center">
                                        <span className="font-medium text-eco-primary-600 hover:text-eco-primary-500">Subir archivos</span>
                                        <p className="pl-1">o arrastrar y soltar</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                                </div>
                            </div>
                            {images && images.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {Array.from(images).map((file, idx) => (
                                        <div key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 font-medium">
                                            {file.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <ErrorMsg field="images" />
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="bg-white text-gray-700 px-6 py-3 rounded-xl mr-4 font-bold border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-eco-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-eco-primary-700 shadow-lg shadow-eco-primary-600/30 disabled:opacity-50 transition-all transform active:scale-95"
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
