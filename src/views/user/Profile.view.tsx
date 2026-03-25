import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import Header from '../../components/layout/Header';

const STORAGE_URL = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '/storage') || 'http://localhost:8000/storage';

const Profile: React.FC = () => {
    const user = authService.getCurrentUser();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });
    const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

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
    }, [user?.id]);

    // Estado para drag & drop
    const [isDragging, setIsDragging] = useState(false);

    // Prevenir comportamiento por defecto del navegador al arrastrar archivos
    useEffect(() => {
        const preventDefaults = (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        };

        // Prevenir que el navegador abra el archivo
        window.addEventListener('dragover', preventDefaults);
        window.addEventListener('drop', preventDefaults);

        return () => {
            window.removeEventListener('dragover', preventDefaults);
            window.removeEventListener('drop', preventDefaults);
        };
    }, []);

    // Funciones para manejar drag & drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files[0] && files[0].type.startsWith('image/')) {
            setProfileData({ ...profileData, avatarFile: files[0] });
        }
    };

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

        // Validación: Contraseñas coinciden
        if (passwordData.password !== passwordData.password_confirmation) {
            const errorMsg = 'Las contraseñas no coinciden';
            setPasswordMsg({ type: 'error', text: errorMsg });
            return;
        }

        // Validación: Longitud mínima
        if (passwordData.password.length < 6) {
            const errorMsg = 'La nueva contraseña debe tener al menos 6 caracteres';
            setPasswordMsg({ type: 'error', text: errorMsg });
            return;
        }

        setLoading(true);
        setPasswordMsg({ type: '', text: '' });
        try {
            const response = await authService.updatePassword(passwordData);

            // Limpiar campos del formulario primero
            setPasswordData({ current_password: '', password: '', password_confirmation: '' });

            // Limpiar sesión local directamente (los tokens ya fueron revocados en el backend)
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');

            // Mostrar alerta de confirmación con el mensaje del backend
            alert(response.message || 'Cambio de contraseña exitoso. Por favor, ingrese nuevamente para iniciar sesión con sus nuevas credenciales.');

            // Redirigir al login (replace fuerza recarga completa)
            window.location.replace('/login');
        } catch (error: any) {
            // Extraer mensaje de error en español
            let errorMessage = 'Error al actualizar contraseña';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
                // Si hay errores de validación, tomar el primero
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0];
                if (Array.isArray(firstError) && firstError.length > 0) {
                    errorMessage = firstError[0] as string;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            // Solo mostrar el error en la UI, sin alert
            setPasswordMsg({ type: 'error', text: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-eco-bg font-sans">
            <Header />
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="flex items-center gap-4 mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 font-display">Mi Perfil</h1>
                    <span className="bg-eco-primary-100 text-eco-primary-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {user.role}
                    </span>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-xl mb-8 flex items-center gap-3 animate-fade-in ${msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        {msg.type === 'success' ? (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        )}
                        <span className="font-medium">{msg.text}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Sidebar / Tabs */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 sticky top-24">
                            <div className="p-8 text-center bg-gradient-to-b from-eco-primary-50 to-transparent">
                                <div
                                    className={`w-32 h-32 mx-auto bg-white rounded-full mb-6 p-1 border-4 shadow-lg relative group transition-all ${isDragging ? 'border-eco-primary-500 scale-105' : 'border-white'
                                        }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative">
                                        {profileData.avatar || profileData.avatarFile ? (
                                            <img
                                                src={
                                                    profileData.avatarFile
                                                        ? URL.createObjectURL(profileData.avatarFile)
                                                        : (profileData.avatar.startsWith('http')
                                                            ? profileData.avatar
                                                            : `/upload/${profileData.avatar.split('/').pop()}`)
                                                }
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.src.includes('storage') && !profileData.avatarFile) {
                                                        target.src = `${STORAGE_URL}/${profileData.avatar}`;
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-5xl text-gray-300 font-bold bg-gray-50">
                                                {user.name[0]}
                                            </div>
                                        )}

                                        <label htmlFor="avatar-upload" className={`absolute inset-0 flex items-center justify-center transition-opacity cursor-pointer ${isDragging ? 'bg-eco-primary-500/60 opacity-100' : 'bg-black/40 opacity-0 group-hover:opacity-100'
                                            }`}>
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </label>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h3>
                                <p className="text-sm text-eco-primary-600 font-medium">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Forms */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 font-display">
                                <svg className="w-5 h-5 text-eco-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                Información Personal
                            </h2>
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                {/* Hidden file input triggered by avatar overlay */}
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setProfileData({ ...profileData, avatarFile: e.target.files[0] });
                                        }
                                    }}
                                    className="hidden"
                                />

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                                    />
                                    <p className="mt-1 text-xs text-gray-400">El correo electrónico no se puede cambiar.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bio / Descripción</label>
                                    <textarea
                                        value={profileData.bio}
                                        onChange={e => setProfileData({ ...profileData, bio: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white resize-none h-32"
                                        placeholder="Cuéntanos un poco sobre ti..."
                                    />
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="auth-button w-auto px-6 shadow-lg shadow-eco-primary-500/20"
                                    >
                                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Password Change */}
                        <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 font-display">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                Seguridad
                            </h2>

                            {/* Mensaje de error/éxito para contraseña */}
                            {passwordMsg.text && (
                                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in ${passwordMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                    {passwordMsg.type === 'success' ? (
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                    ) : (
                                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    )}
                                    <span className="font-medium">{passwordMsg.text}</span>
                                </div>
                            )}

                            <form onSubmit={handlePasswordUpdate} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        value={passwordData.current_password}
                                        onChange={e => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwordData.password}
                                            onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Contraseña</label>
                                        <input
                                            type="password"
                                            value={passwordData.password_confirmation}
                                            onChange={e => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-eco-primary-500 focus:border-eco-primary-500 outline-none transition-all bg-gray-50 focus:bg-white"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="pt-2 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 rounded-full bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors shadow-lg shadow-gray-400/20"
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
