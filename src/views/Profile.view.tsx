import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Header from '../components/layout/Header';

const Profile: React.FC = () => {
    const user = authService.getCurrentUser();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const [profileData, setProfileData] = useState<{
        name: string;
        email: string;
        bio: string;
        avatar: string;
        avatarFile?: File;
    }>({
        name: '',
        email: '',
        bio: '',
        avatar: ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                avatar: user.avatar || ''
            });
        }
    }, [user?.id]); // Fix: Use primitive to avoid infinite re-render loop

    if (!authService.isAuthenticated() || !user) {
        return <Navigate to="/login" replace />;
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });
        try {
            let data: any = { name: profileData.name, bio: profileData.bio };

            // If avatar file is selected, use FormData
            if (profileData.avatarFile) {
                const formData = new FormData();
                formData.append('name', profileData.name);
                formData.append('bio', profileData.bio);
                formData.append('avatar', profileData.avatarFile);
                data = formData;
            }

            await authService.updateProfile(data);
            setMsg({ type: 'success', text: 'Perfil actualizado correctamente' });
        } catch (error: any) {
            setMsg({ type: 'error', text: error.message || 'Error al actualizar perfil' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.password !== passwordData.password_confirmation) {
            setMsg({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }
        setLoading(true);
        setMsg({ type: '', text: '' });
        try {
            await authService.updatePassword(passwordData);
            setMsg({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });
        } catch (error: any) {
            setMsg({ type: 'error', text: error.message || 'Error al actualizar contraseña' });
        } finally {
            setLoading(false);
        }
    };

    // Note: Password update endpoint might be missing in authService interface, need to check.
    // Spec says PUT /me/password. Let's assume or implement it.
    // If not in authService, we might need to add it.

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Mi Perfil</h1>

                {msg.text && (
                    <div className={`p-4 rounded-lg mb-6 ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {msg.text}
                    </div>
                )}



                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Tabs */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                            <div className="p-6 text-center border-b border-gray-100">
                                <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full mb-4 overflow-hidden relative group">
                                    {profileData.avatar ? (
                                        <img
                                            src={
                                                profileData.avatar.startsWith('http')
                                                    ? profileData.avatar
                                                    : `/upload/${profileData.avatar.split('/').pop()}`
                                            }
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                // Fallback to storage if local upload fails
                                                const target = e.target as HTMLImageElement;
                                                if (!target.src.includes('storage')) {
                                                    target.src = `http://localhost:8000/storage/${profileData.avatar}`;
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="flex items-center justify-center h-full text-4xl text-gray-400">👤</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-800">{user.name}</h3>
                                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                            </div>
                        </div>
                    </div>

                    {/* Forms */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Profile Info */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-700 mb-4">Información Personal</h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Foto de Perfil</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                setProfileData({ ...profileData, avatarFile: e.target.files[0] });
                                            }
                                        }}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-eco-teal-50 file:text-eco-teal-700 hover:file:bg-eco-teal-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-teal-500 focus:ring-eco-teal-500 p-2 border"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bio / Descripción</label>
                                    <textarea
                                        value={profileData.bio}
                                        onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-teal-500 focus:ring-eco-teal-500 p-2 border"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-eco-teal-500 text-white px-4 py-2 rounded-lg hover:bg-eco-teal-600 disabled:opacity-50 font-bold"
                                    >
                                        {loading ? 'Guardando...' : 'Guardar Perfil'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Password Change */}
                        <div className="bg-white rounded-xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-700 mb-4">Cambiar Contraseña</h2>
                            <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-teal-500 focus:ring-eco-teal-500 p-2 border"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        value={passwordData.password}
                                        onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-teal-500 focus:ring-eco-teal-500 p-2 border"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                                    <input
                                        type="password"
                                        value={passwordData.password_confirmation}
                                        onChange={e => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-eco-teal-500 focus:ring-eco-teal-500 p-2 border"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 disabled:opacity-50 font-bold"
                                    >
                                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
