import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import type { LoginCredentials } from '../models/User.model';

/**
 * Vista de Login
 */
const Login: React.FC = () => {
    const [credentials, setCredentials] = useState<LoginCredentials>({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authService.login(credentials);
            // Redirigir según rol
            if (response.user.role === 'admin' || response.user.role === 'partner') {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/home';
            }
        } catch (err: any) {
            // Manejar error desde authService
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="auth-card backdrop-blur-xl bg-white/90">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-eco-primary-500 to-eco-primary-700 rounded-2xl shadow-lg flex items-center justify-center transform -rotate-3 transition-transform hover:rotate-0 duration-300">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>

            <h2 className="text-3xl font-display font-bold text-center text-gray-800 mb-2">
                ¡Bienvenido de nuevo!
            </h2>
            <p className="text-center text-gray-500 mb-8 font-light">
                Accede a tu cuenta y continúa tu aventura
            </p>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r shadow-sm mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2 pl-1">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={credentials.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className="auth-input ring-offset-2 focus:ring-2 focus:ring-eco-primary-500/20"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2 pl-1">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="auth-input ring-offset-2 focus:ring-2 focus:ring-eco-primary-500/20"
                    />
                </div>

                <div className="flex items-center justify-between text-sm pt-2">
                    <label className="flex items-center cursor-pointer group">
                        <input type="checkbox" className="w-4 h-4 text-eco-primary-600 border-gray-300 rounded focus:ring-eco-primary-500 transition-colors cursor-pointer" />
                        <span className="ml-2 text-gray-600 group-hover:text-eco-primary-700 transition-colors">Recordarme</span>
                    </label>
                    <Link to="/forgot-password" className="auth-link text-sm hover:underline">
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                <button type="submit" disabled={loading} className="auth-button disabled:opacity-70 disabled:cursor-not-allowed mt-6 transform active:scale-95 duration-200">
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Iniciando...
                        </span>
                    ) : 'Iniciar Sesión'}
                </button>
            </form>

            <p className="text-center text-gray-600 mt-8 text-sm">
                ¿Aún no tienes cuenta?{' '}
                <Link to="/register" className="auth-link font-bold hover:underline">
                    Regístrate gratis
                </Link>
            </p>
        </div>
    );
};

export default Login;