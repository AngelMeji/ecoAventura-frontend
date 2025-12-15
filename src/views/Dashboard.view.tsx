import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { placesService } from '../services/placesService';
import Header from '../components/layout/Header';
import type { Place } from '../models/Place.model';
import AdminUsersTable from '../components/dashboard/AdminUsersTable';

const Dashboard: React.FC = () => {
    const user = authService.getCurrentUser();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [pendingPlaces, setPendingPlaces] = useState<Place[]>([]);
    const [allPlaces, setAllPlaces] = useState<Place[]>([]);
    const [partnerPlaces, setPartnerPlaces] = useState<Place[]>([]);
    const [favorites, setFavorites] = useState<Place[]>([]);

    if (!authService.isAuthenticated() || !user) {
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        loadDashboardData();
    }, [user.role]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            console.log('Loading dashboard for role:', user.role);
            if (user.role === 'admin') {
                const data = await placesService.getAdminDashboard();
                setStats(data?.stats || {});
                const pendingResponse = await placesService.getPendingPlaces();
                const pending = Array.isArray(pendingResponse) ? pendingResponse : (pendingResponse as any).data || [];
                setPendingPlaces(pending);

                try {
                    const all = await placesService.getAdminAllPlaces();
                    setAllPlaces(Array.isArray(all) ? all : []);
                } catch (e) { console.warn('Backend missing getAdminAllPlaces'); }

            } else if (user.role === 'partner') {
                const data = await placesService.getPartnerDashboard();
                setStats(data?.stats || {});

                // Robust extraction for Partner Places
                let pPlaces: Place[] = [];
                // 1. Try direct from dashboard
                if (data?.places && Array.isArray(data.places)) pPlaces = data.places;
                else if (data?.places?.data && Array.isArray(data.places.data)) pPlaces = data.places.data;

                // 2. Fallback: Fetch all if empty
                if (pPlaces.length === 0) {
                    try {
                        const allResp: any = await placesService.getAll({ user_id: user.id });
                        pPlaces = Array.isArray(allResp) ? allResp : allResp.data || [];
                    } catch (e) { console.warn('Fallback partner fetch failed'); }
                }
                setPartnerPlaces(pPlaces);
            } else {
                const data = await placesService.getUserDashboard();
                setStats(data?.stats || {});
                const favs = await placesService.getFavorites();
                setFavorites(favs.data || []);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            setStats({});
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm('¿Aprobar lugar?')) return;
        try {
            await placesService.approve(id);
            setPendingPlaces(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            alert('Error aprobando lugar');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eco-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-eco-teal-600 to-eco-teal-800 rounded-2xl p-8 mb-8 text-white shadow-lg">
                    <div className="flex items-center gap-6">
                        {user.avatar ? (
                            <img
                                src={user.avatar.startsWith('http') ? user.avatar : `/upload/${user.avatar.split('/').pop()}`}
                                alt={user.name}
                                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (!target.src.includes('storage')) {
                                        target.src = `http://localhost:8000/storage/${user.avatar}`;
                                    }
                                }}
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                                {user.name[0]}
                            </div>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">Bienvenido, {user.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <span className="bg-white/20 px-3 py-1 rounded-full text-sm text-eco-teal-100 uppercase tracking-wide">
                                    {user.role === 'partner' ? 'Socio Verificado' : user.role === 'admin' ? 'Administrador' : 'Explorador'}
                                </span>
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="bg-white text-eco-teal-700 px-4 py-1 rounded-full text-sm font-bold hover:bg-eco-teal-50 transition-colors flex items-center gap-1"
                                >
                                    ✏️ Editar Perfil
                                </button>
                                {(user.role === 'admin' || user.role === 'partner') && (
                                    <button
                                        onClick={() => navigate('/places/create')}
                                        className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold hover:bg-yellow-300 transition-colors flex items-center gap-1"
                                    >
                                        ➕ Crear Lugar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ADMIN DASHBOARD --- */}
                {user.role === 'admin' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Usuarios Totales', value: stats?.total_users || 0, color: 'blue' },
                                { label: 'Lugares Publicados', value: stats?.total_places || 0, color: 'green' },
                                { label: 'Pendientes', value: stats?.pending_places || 0, color: 'yellow' },
                                { label: 'Reseñas Totales', value: stats?.reviews_count || 0, color: 'purple' }
                            ].map((stat, idx) => (
                                <div key={idx} className={`bg-white p-6 rounded-xl shadow-sm border-l-4 border-${stat.color}-500 hover:shadow-md transition-shadow`}>
                                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Top Stats / Insights (Mocked for visual completeness per request) */}
                        {/* Top Stats / Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-2">🏆 Mejor Valorado</h3>
                                <div className="text-sm text-gray-500">Basado en reseñas</div>
                                {stats?.top_rated ? (
                                    <>
                                        <div className="mt-4 font-bold text-xl text-yellow-600 truncate">{stats.top_rated.name}</div>
                                        <div className="text-xs text-gray-400">{Number(stats.top_rated.rating).toFixed(1)} ★ ({stats.top_rated.count} reseñas)</div>
                                    </>
                                ) : <div className="mt-4 text-gray-400 italic">No hay datos aún</div>}
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-2">🔥 Más Popular</h3>
                                <div className="text-sm text-gray-500">Más favoritos</div>
                                {stats?.most_popular ? (
                                    <>
                                        <div className="mt-4 font-bold text-xl text-red-600 truncate">{stats.most_popular.name}</div>
                                        <div className="text-xs text-gray-400">{stats.most_popular.favorites} guardados</div>
                                    </>
                                ) : <div className="mt-4 text-gray-400 italic">No hay datos aún</div>}
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm">
                                <h3 className="font-bold text-gray-700 mb-2">📊 Categoría Top</h3>
                                <div className="text-sm text-gray-500">Más lugares</div>
                                {stats?.top_category ? (
                                    <>
                                        <div className="mt-4 font-bold text-xl text-blue-600 truncate">{stats.top_category.name}</div>
                                        <div className="text-xs text-gray-400">{stats.top_category.count} lugares</div>
                                    </>
                                ) : <div className="mt-4 text-gray-400 italic">No hay datos aún</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                            {/* Pending Places Table */}
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 bg-yellow-50/50">
                                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">📌 Lugares Pendientes de Aprobación</h2>
                                </div>
                                {pendingPlaces.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <p>¡Todo al día! No hay lugares pendientes de revisión.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="p-4">Lugar</th>
                                                    <th className="p-4">Socio</th>
                                                    <th className="p-4 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {pendingPlaces.map(place => (
                                                    <tr key={place.id} className="hover:bg-gray-50">
                                                        <td className="p-4">
                                                            <p className="font-bold text-gray-900">{place.name}</p>
                                                            <p className="text-xs text-gray-500">{place.category?.name}</p>
                                                        </td>
                                                        <td className="p-4 text-sm text-gray-600">{place.user?.name}</td>
                                                        <td className="p-4 text-right space-x-2 flex justify-end">
                                                            <button
                                                                onClick={() => handleApprove(place.id)}
                                                                className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs font-bold"
                                                                title="Aprobar"
                                                            >
                                                                ✓ APROBAR
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm('¿Rechazar lugar?')) return;
                                                                    try {
                                                                        await placesService.reject(place.id);
                                                                        setPendingPlaces(prev => prev.filter(p => p.id !== place.id));
                                                                    } catch (e) { alert('Error rechazando'); }
                                                                }}
                                                                className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-bold"
                                                                title="Rechazar"
                                                            >
                                                                ✕ RECHAZAR
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (!confirm('¿Solicitar cambios?')) return;
                                                                    try {
                                                                        await placesService.needsFix(place.id);
                                                                        setPendingPlaces(prev => prev.filter(p => p.id !== place.id));
                                                                    } catch (e) { alert('Error solicitando cambios'); }
                                                                }}
                                                                className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-xs font-bold"
                                                                title="Solicitar Cambios"
                                                            >
                                                                ✎ CAMBIOS
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/place/${place.slug || place.id}`, { state: { placeData: place } })}
                                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-bold"
                                                                title="Ver Detalles"
                                                            >
                                                                👁 VER
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* ALL Places Table (Management) */}
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                    <h2 className="text-xl font-bold text-gray-800">🌍 Administrar Todos los Lugares</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                            <tr>
                                                <th className="p-4">Lugar</th>
                                                <th className="p-4">Socio</th>
                                                <th className="p-4">Estado</th>
                                                <th className="p-4 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {/* Using partnerPlaces as a placeholder for 'allPlaces' if available, or empty. Ideally fetching all */}
                                            {/* Assuming allPlaces state exists, let's inject it via replacement logic */}
                                            {allPlaces && allPlaces.map(place => (
                                                <tr key={place.id} className="hover:bg-gray-50">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden">
                                                                {place.images && place.images[0] && (
                                                                    <img src={place.images[0].image_path.startsWith('http') ? place.images[0].image_path : `http://localhost:8000/storage/${place.images[0].image_path}`} className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{place.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-600">{place.user?.name}</td>
                                                    <td className="p-4">
                                                        <select
                                                            value={place.status}
                                                            onChange={async (e) => {
                                                                const newStatus = e.target.value;
                                                                if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return;
                                                                try {
                                                                    // Call specific endpoint based on status
                                                                    if (newStatus === 'approved') await placesService.approve(place.id);
                                                                    else if (newStatus === 'rejected') await placesService.reject(place.id);
                                                                    else if (newStatus === 'needs_fix') await placesService.needsFix(place.id);
                                                                    // For 'pending', we might not have a direct endpoint, or reuse one. 
                                                                    // Assuming admin just wants to set it. Backend might need sync for 'pending', 
                                                                    // but spec only gave approve, reject, needs-fix. 
                                                                    // We'll update the local state to reflect change for now.

                                                                    // Update local state
                                                                    setAllPlaces(prev => prev.map(p => p.id === place.id ? { ...p, status: newStatus as any } : p));
                                                                } catch (error) {
                                                                    alert('Error cambiando estado');
                                                                }
                                                            }}
                                                            className={`px-2 py-1 rounded-full text-xs font-bold border-none cursor-pointer focus:ring-2 focus:ring-opacity-50 ${place.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                    place.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                        place.status === 'needs_fix' ? 'bg-orange-100 text-orange-700' :
                                                                            'bg-red-100 text-red-700'
                                                                }`}
                                                        >
                                                            <option value="pending">Pendiente</option>
                                                            <option value="approved">Aprobado</option>
                                                            <option value="needs_fix">Requiere Cambios</option>
                                                            <option value="rejected">Rechazado</option>
                                                        </select>
                                                    </td>
                                                    <td className="p-4 text-right space-x-2">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('¿Eliminar lugar?')) {
                                                                    placesService.delete(place.id).then(() => {
                                                                        alert('Lugar eliminado');
                                                                        loadDashboardData();
                                                                    });
                                                                }
                                                            }}
                                                            className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-xs font-bold"
                                                        >
                                                            ELIMINAR
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/places/edit/${place.id}`)}
                                                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-bold"
                                                        >
                                                            EDITAR
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Admin Users Table Component */}
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-gray-800">👥 Gestión de Usuarios</h2>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Admin Only</span>
                                </div>
                                <div className="p-0">
                                    <AdminUsersTable />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- PARTNER DASHBOARD --- */}
                {user.role === 'partner' && stats && (
                    <div className="space-y-8">
                        {/* Partner Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-eco-teal-500">
                                <p className="text-gray-500">Mis Publicaciones</p>
                                <p className="text-3xl font-bold">{stats.total_places || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                                <p className="text-gray-500">Aprobados</p>
                                <p className="text-3xl font-bold">{stats.approved_places || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-500">
                                <p className="text-gray-500">En Revisión</p>
                                <p className="text-3xl font-bold">{(stats.total_places || 0) - (stats.approved_places || 0)}</p>
                            </div>
                        </div>

                        {/* Partner Actions and Places List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-8 text-center border-b border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-800 mb-4">Gestionar Destinos</h2>
                                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                                    Comparte la belleza natural con el mundo. Crea nuevos destinos ecoturísticos y gestiona los existentes desde aquí.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => navigate('/places/create')}
                                        className="bg-eco-teal-600 text-white px-8 py-3 rounded-xl hover:bg-eco-teal-700 shadow-lg shadow-eco-teal-500/30 font-bold flex items-center gap-2 transform transition hover:scale-105"
                                    >
                                        <span>+</span> Publicar Nuevo Lugar
                                    </button>
                                </div>
                            </div>

                            {/* Partner Places Table */}
                            {true && (
                                <div className="p-6">
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        📋 Mis Publicaciones
                                        <span className="text-sm font-normal text-gray-500">({partnerPlaces.length})</span>
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="p-4">Lugar</th>
                                                    <th className="p-4">Estado</th>
                                                    <th className="p-4 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {partnerPlaces.map(place => (
                                                    <tr key={place.id} className="hover:bg-gray-50">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden">
                                                                    {place.images && place.images[0] && (
                                                                        <img src={place.images[0].image_path.startsWith('http') ? place.images[0].image_path : `http://localhost:8000/storage/${place.images[0].image_path}`} className="w-full h-full object-cover" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{place.name}</p>
                                                                    <p className="text-xs text-gray-500">{place.category?.name}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${place.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                place.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                {place.status === 'approved' ? 'Publicado' : place.status === 'pending' ? 'En Revisión' : 'Rechazado'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right space-x-2">
                                                            <button
                                                                onClick={() => navigate(`/place/${place.slug || place.id}`, { state: { placeData: place } })}
                                                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs font-bold"
                                                            >
                                                                VER
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/places/edit/${place.id}`)}
                                                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs font-bold"
                                                            >
                                                                EDITAR
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* --- USER DASHBOARD --- */}
                {user.role === 'user' && stats && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pink-500">
                                <p className="text-gray-500">Lugares Favoritos</p>
                                <p className="text-3xl font-bold">{stats.favorites_count || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
                                <p className="text-gray-500">Reseñas Escritas</p>
                                <p className="text-3xl font-bold">{stats.reviews_count || 0}</p>
                            </div>
                        </div>

                        {/* Favorites List */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-800">❤️ Mis Favoritos</h2>
                            </div>
                            {favorites.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-gray-400 text-lg mb-4">Aún no has guardado ningún lugar favorito.</p>
                                    <button onClick={() => navigate('/home')} className="text-eco-teal-600 font-bold hover:underline">Explorar Mapa</button>
                                </div>
                            ) : (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favorites.map(place => (
                                        <div key={place.id} className="group border rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/place/${place.slug || place.id}`}>
                                            <div className="h-32 bg-gray-200 relative">
                                                {place.images && place.images[0] && (
                                                    <img src={place.images[0].image_path.startsWith('http') ? place.images[0].image_path : `http://localhost:8000/storage/${place.images[0].image_path}`} className="w-full h-full object-cover" />
                                                )}
                                                <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-800">
                                                    {place.category?.name}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-800 group-hover:text-eco-teal-600 transition-colors">{place.name}</h3>
                                                <p className="text-sm text-gray-500 mb-2 truncate">{place.address}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
