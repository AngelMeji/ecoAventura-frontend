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
            console.log('Categories loaded:', data);
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
                // Formatting Laravel validation errors
                errorDetails = Object.values(errors).flat().join('\n');
            }

            alert(`Error al guardar:\n${msg}\n${errorDetails}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    {isEditing ? 'Editar Lugar' : 'Publicar Nuevo Lugar'}
                </h1>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Nombre del Lugar *</label>
                                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Categoría *</label>
                                <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border">
                                    <option value="">Seleccionar...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dificultad</label>
                                <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border">
                                    <option value="baja">Baja</option>
                                    <option value="media">Media</option>
                                    <option value="alta">Alta</option>
                                    <option value="experto">Experto</option>
                                </select>
                            </div>
                        </div>

                        {/* Descriptions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción Corta *</label>
                            <input required type="text" value={shortDesc} onChange={e => setShortDesc(e.target.value)} className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border" placeholder="Resumen breve para tarjetas" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Descripción Detallada</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} className="form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border"></textarea>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Duración Estimada</label>
                                <input type="text" value={duration} onChange={e => setDuration(e.target.value)} className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border" placeholder="Ej: 3 horas, 2 días..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mejor Temporada</label>
                                <input type="text" value={bestSeason} onChange={e => setBestSeason(e.target.value)} className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border" placeholder="Ej: Verano, Todo el año..." />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Dirección / Referencia</label>
                                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Latitud</label>
                                    <input type="number" step="any" value={latitude} onChange={e => setLatitude(e.target.value)} className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Longitud</label>
                                    <input type="number" step="any" value={longitude} onChange={e => setLongitude(e.target.value)} className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border" />
                                </div>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="border-t pt-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Imágenes</h3>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={e => setImages(e.target.files)}
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-eco-teal-50 file:text-eco-teal-700
                                hover:file:bg-eco-teal-100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Puedes seleccionar múltiples archivos.</p>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg mr-4 font-medium hover:bg-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-eco-teal-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-eco-teal-700 shadow-lg disabled:opacity-50"
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
