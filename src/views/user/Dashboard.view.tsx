import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { placesService } from '../../services/placesService';
import Header from '../../components/layout/Header';
import type { Place } from '../../models/Place.model';
import AdminUsersTable from '../../components/dashboard/AdminUsersTable';

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
            <div className="min-h-screen flex items-center justify-center bg-eco-bg">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-eco-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-eco-bg font-sans text-eco-text">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-eco-primary-800 to-eco-primary-600 rounded-3xl p-8 mb-10 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-[1px]"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        {user.avatar ? (
                            <div className="relative">
                                <img
                                    src={user.avatar.startsWith('http') ? user.avatar : `/upload/${user.avatar.split('/').pop()}`}
                                    alt={user.name}
                                    className="w-24 h-24 rounded-full border-4 border-white/20 object-cover shadow-lg"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        if (!target.src.includes('storage')) {
                                            target.src = `http://localhost:8000/storage/${user.avatar}`;
                                        }
                                    }}
                                />
                                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 border-2 border-eco-primary-800 rounded-full"></div>
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold border-4 border-white/10 shadow-lg">
                                {user.name[0]}
                            </div>
                        )}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl font-bold font-display mb-2 text-white">Hola, {user.name}</h1>
                            <p className="text-eco-primary-100 mb-4 text-lg">
                                {user.role === 'partner' ? 'Gestor de Experiencias' : user.role === 'admin' ? 'Administrador del Sistema' : 'Explorador Ecoturístico'}
                            </p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    Editar Perfil
                                </button>
                                {(user.role === 'admin' || user.role === 'partner') && (
                                    <button
                                        onClick={() => navigate('/places/create')}
                                        className="bg-white text-eco-primary-900 px-5 py-2 rounded-full text-sm font-bold hover:bg-eco-primary-50 transition-colors flex items-center gap-2 shadow-lg shadow-black/10"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Crear Nuevo Lugar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- ADMIN DASHBOARD --- */}
                {user.role === 'admin' && (
                    <div className="space-y-10">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Usuarios Totales', value: stats?.total_users || 0, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Lugares Publicados', value: stats?.total_places || 0, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Pendientes', value: stats?.pending_places || 0, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                                { label: 'Reseñas Totales', value: stats?.reviews_count || 0, icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />, color: 'text-purple-600', bg: 'bg-purple-50' }
                            ].map((stat, idx) => (
                                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">{stat.icon}</svg>
                                        </div>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{stat.label}</p>
                                    <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Top Stats / Insights */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 font-display text-lg">
                                    <span className="text-yellow-500">🏆</span> Mejor Valorado
                                </h3>
                                {stats?.top_rated ? (
                                    <>
                                        <div className="font-bold text-xl text-gray-900 truncate mb-1">{stats.top_rated.name}</div>
                                        <div className="text-sm text-gray-500 font-medium">{Number(stats.top_rated.rating).toFixed(1)} ★ ({stats.top_rated.count} reseñas)</div>
                                    </>
                                ) : <div className="text-gray-400 italic">No hay datos aún</div>}
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 font-display text-lg">
                                    <span className="text-red-500">🔥</span> Más Popular
                                </h3>
                                {stats?.most_popular ? (
                                    <>
                                        <div className="font-bold text-xl text-gray-900 truncate mb-1">{stats.most_popular.name}</div>
                                        <div className="text-sm text-gray-500 font-medium">{stats.most_popular.favorites} guardados</div>
                                    </>
                                ) : <div className="text-gray-400 italic">No hay datos aún</div>}
                            </div>
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 font-display text-lg">
                                    <span className="text-blue-500">📊</span> Categoría Top
                                </h3>
                                {stats?.top_category ? (
                                    <>
                                        <div className="font-bold text-xl text-gray-900 truncate mb-1">{stats.top_category.name}</div>
                                        <div className="text-sm text-gray-500 font-medium">{stats.top_category.count} lugares</div>
                                    </>
                                ) : <div className="text-gray-400 italic">No hay datos aún</div>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {/* Pending Places Table */}
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 bg-yellow-50/30 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-yellow-400 rounded-full"></div>
                                    <h2 className="text-xl font-bold text-gray-800 font-display">Lugares Pendientes de Aprobación</h2>
                                </div>
                                {pendingPlaces.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <p className="text-gray-500 text-lg">¡Todo al día! No hay lugares pendientes de revisión.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                                <tr>
                                                    <th className="p-6">Lugar</th>
                                                    <th className="p-6">Socio</th>
                                                    <th className="p-6 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {pendingPlaces.map(place => (
                                                    <tr key={place.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-6">
                                                            <div className="font-bold text-gray-900 text-lg mb-1">{place.name}</div>
                                                            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-eco-primary-50 text-eco-primary-700">
                                                                {place.category?.name}
                                                            </div>
                                                        </td>
                                                        <td className="p-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                                    {(place.user?.name || '?')[0]}
                                                                </div>
                                                                <span className="text-sm font-medium text-gray-700">{place.user?.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-6 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => handleApprove(place.id)}
                                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                                    title="Aprobar"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm('¿Solicitar cambios?')) return;
                                                                        try {
                                                                            await placesService.needsFix(place.id);
                                                                            setPendingPlaces(prev => prev.filter(p => p.id !== place.id));
                                                                        } catch (e) { alert('Error solicitando cambios'); }
                                                                    }}
                                                                    className="p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                                                                    title="Solicitar Cambios"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm('¿Rechazar lugar?')) return;
                                                                        try {
                                                                            await placesService.reject(place.id);
                                                                            setPendingPlaces(prev => prev.filter(p => p.id !== place.id));
                                                                        } catch (e) { alert('Error rechazando'); }
                                                                    }}
                                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                    title="Rechazar"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => navigate(`/place/${place.slug || place.id}`, { state: { placeData: place } })}
                                                                    className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                                    title="Ver Detalles"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* ALL Places Table (Management) */}
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                                    <div className="w-2 h-8 bg-eco-primary-500 rounded-full"></div>
                                    <h2 className="text-xl font-bold text-gray-800 font-display">Administrar Todos los Lugares</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                            <tr>
                                                <th className="p-6">Lugar</th>
                                                <th className="p-6">Socio</th>
                                                <th className="p-6">Estado</th>
                                                <th className="p-6 text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {allPlaces && allPlaces.map(place => (
                                                <tr key={place.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden shadow-sm">
                                                                {place.images && place.images[0] && (
                                                                    <img src={place.images[0].image_path.startsWith('http') ? place.images[0].image_path : `http://localhost:8000/storage/${place.images[0].image_path}`} className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{place.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6 text-sm text-gray-600 font-medium">{place.user?.name}</td>
                                                    <td className="p-6">
                                                        <select
                                                            value={place.status}
                                                            onChange={async (e) => {
                                                                const newStatus = e.target.value;
                                                                if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return;
                                                                try {
                                                                    if (newStatus === 'approved') await placesService.approve(place.id);
                                                                    else if (newStatus === 'rejected') await placesService.reject(place.id);
                                                                    else if (newStatus === 'needs_fix') await placesService.needsFix(place.id);
                                                                    setAllPlaces(prev => prev.map(p => p.id === place.id ? { ...p, status: newStatus as any } : p));
                                                                } catch (error) {
                                                                    alert('Error cambiando estado');
                                                                }
                                                            }}
                                                            className={`px-3 py-1.5 rounded-full text-xs font-bold border-none cursor-pointer focus:ring-2 focus:ring-offset-1 transition-all ${place.status === 'approved' ? 'bg-green-100 text-green-700' :
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
                                                    <td className="p-6 text-right space-x-2">
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm('¿Eliminar lugar?')) {
                                                                    placesService.delete(place.id).then(() => {
                                                                        alert('Lugar eliminado');
                                                                        loadDashboardData();
                                                                    });
                                                                }
                                                            }}
                                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/places/edit/${place.id}`)}
                                                            className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Admin Users Table Component */}
                            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                                        <h2 className="text-xl font-bold text-gray-800 font-display">Gestión de Usuarios</h2>
                                    </div>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Admin</span>
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
                    <div className="space-y-10">
                        {/* Partner Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <svg className="w-24 h-24 text-eco-primary-500" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Mis Publicaciones</p>
                                <p className="text-4xl font-bold text-eco-primary-700 mt-2">{stats.total_places || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <svg className="w-24 h-24 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">Aprobados</p>
                                <p className="text-4xl font-bold text-green-600 mt-2">{stats.approved_places || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <svg className="w-24 h-24 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium text-sm uppercase tracking-wide">En Revisión</p>
                                <p className="text-4xl font-bold text-yellow-600 mt-2">{(stats.total_places || 0) - (stats.approved_places || 0)}</p>
                            </div>
                        </div>

                        {/* Partner Actions and Places List */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-10 text-center border-b border-gray-100 bg-eco-primary-50/30">
                                <h2 className="text-3xl font-bold text-gray-800 mb-4 font-display">Gestionar Destinos</h2>
                                <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-lg">
                                    Comparte la belleza natural con el mundo. Crea nuevos destinos ecoturísticos y gestiona los existentes desde aquí.
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => navigate('/places/create')}
                                        className="auth-button w-auto px-8 shadow-lg shadow-eco-primary-500/20 text-lg flex items-center gap-3 transform hover:scale-105"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                        Publicar Nuevo Lugar
                                    </button>
                                </div>
                            </div>

                            {/* Partner Places Table */}
                            {true && (
                                <div className="p-8">
                                    <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-3 text-xl font-display">
                                        Mis Publicaciones
                                        <span className="text-sm font-normal bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-sans">Total: {partnerPlaces.length}</span>
                                    </h3>
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                                <tr>
                                                    <th className="p-4">Lugar</th>
                                                    <th className="p-4">Estado</th>
                                                    <th className="p-4 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {partnerPlaces.map(place => (
                                                    <tr key={place.id} className="hover:bg-gray-50/50 transition-colors">
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-16 h-12 rounded-lg bg-gray-200 overflow-hidden shadow-sm">
                                                                    {place.images && place.images[0] && (
                                                                        <img src={place.images[0].image_path.startsWith('http') ? place.images[0].image_path : `http://localhost:8000/storage/${place.images[0].image_path}`} className="w-full h-full object-cover" />
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-gray-900">{place.name}</p>
                                                                    <p className="text-xs text-eco-primary-600 font-medium">{place.category?.name}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${place.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                                place.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                                }`}>
                                                                <span className={`w-2 h-2 rounded-full ${place.status === 'approved' ? 'bg-green-500' : place.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                                                {place.status === 'approved' ? 'Publicado' : place.status === 'pending' ? 'En Revisión' : 'Rechazado'}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-right space-x-2">
                                                            <button
                                                                onClick={() => navigate(`/place/${place.slug || place.id}`, { state: { placeData: place } })}
                                                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs font-bold transition-colors"
                                                            >
                                                                VER
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/places/edit/${place.id}`)}
                                                                className="px-3 py-1.5 bg-eco-primary-100 text-eco-primary-700 rounded-lg hover:bg-eco-primary-200 text-xs font-bold transition-colors"
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
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <svg className="w-32 h-32 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium uppercase tracking-wide z-10 relative">Lugares Favoritos</p>
                                <p className="text-4xl font-bold text-gray-800 mt-2 z-10 relative">{stats.favorites_count || 0}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-all">
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <svg className="w-32 h-32 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" /></svg>
                                </div>
                                <p className="text-gray-500 font-medium uppercase tracking-wide z-10 relative">Reseñas Escritas</p>
                                <p className="text-4xl font-bold text-gray-800 mt-2 z-10 relative">{stats.reviews_count || 0}</p>
                            </div>
                        </div>

                        {/* Favorites List */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                                <span className="text-2xl">❤️</span>
                                <h2 className="text-xl font-bold text-gray-800 font-display">Mis Favoritos</h2>
                            </div>
                            {favorites.length === 0 ? (
                                <div className="p-16 text-center">
                                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-red-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                                    </div>
                                    <p className="text-gray-500 text-lg mb-6">Aún no has guardado ningún lugar favorito.</p>
                                    <button
                                        onClick={() => navigate('/home')}
                                        className="auth-button w-auto px-8 inline-flex items-center gap-2"
                                    >
                                        Explorar Mapa
                                    </button>
                                </div>
                            ) : (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {favorites.map(place => (
                                        <div key={place.id} className="group border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer bg-white" onClick={() => window.location.href = `/place/${place.slug || place.id}`}>
                                            <div className="h-48 bg-gray-200 relative overflow-hidden">
                                                {place.images && place.images[0] && (
                                                    <img src={place.images[0].image_path.startsWith('http') ? place.images[0].image_path : `http://localhost:8000/storage/${place.images[0].image_path}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                )}
                                                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/50 to-transparent"></div>
                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-eco-primary-800 shadow-sm">
                                                    {place.category?.name}
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-eco-primary-600 transition-colors font-display mb-1">{place.name}</h3>
                                                <p className="text-sm text-gray-500 mb-0 truncate flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    {place.address}
                                                </p>
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
