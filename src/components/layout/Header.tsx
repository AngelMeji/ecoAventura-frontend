import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import { authService } from '../../services/authService';

const Header: React.FC = () => {
    const location = useLocation();
    const user = authService.getCurrentUser();
    const isAuthenticated = !!user;

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        // Clear local storage immediately
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');

        // Call backend to invalidate token (optional, don't await blocking UI)
        authService.logout().catch(console.error);

        // Force reload
        window.location.href = '/login';
    };

    return (
        <header className="bg-white/90 backdrop-blur-md border-b border-eco-primary-100 sticky top-0 z-[9999] shadow-sm transition-all duration-300">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link
                    to="/home"
                    onClick={(e) => {
                        if (location.pathname === '/home') {
                            e.preventDefault();
                            window.location.reload();
                        }
                    }}
                    className="flex-shrink-0 hover:scale-105 transition-transform"
                >
                    <Logo />
                </Link>

                <div className="flex gap-4 items-center">
                    <Link
                        to="/home"
                        onClick={(e) => {
                            if (location.pathname === '/home') {
                                e.preventDefault();
                                window.location.reload();
                            }
                        }}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${isActive('/home')
                            ? 'text-eco-primary-800 bg-eco-primary-100 font-bold shadow-inner'
                            : 'text-gray-600 hover:text-white hover:bg-eco-primary-600 hover:shadow-lg hover:-translate-y-0.5'
                            }`}
                    >
                        Inicio
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${isActive('/dashboard')
                                    ? 'text-eco-primary-800 bg-eco-primary-100 font-bold shadow-inner'
                                    : 'text-gray-600 hover:text-white hover:bg-eco-primary-600 hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                            >
                                {user.role === 'admin' ? 'Panel Admin' : (user.role === 'partner' ? 'Panel Socio' : 'Mi Cuenta')}
                            </Link>
                            <div className="h-6 w-px bg-gray-200 mx-1"></div>
                            <div className="hidden md:flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-eco-primary-100 flex items-center justify-center text-eco-primary-700 font-bold text-sm">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {user?.name}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-full font-medium text-eco-accent-red hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`px-5 py-2 rounded-full font-medium transition-all duration-200 ${isActive('/login')
                                    ? 'text-eco-primary-800 bg-eco-primary-100 font-bold shadow-inner'
                                    : 'text-gray-600 hover:text-white hover:bg-eco-primary-600 hover:shadow-lg hover:-translate-y-0.5'
                                    }`}
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/register"
                                className={`px-5 py-2 rounded-full font-medium transition-all duration-200 shadow-lg shadow-eco-primary-500/20 ${isActive('/register')
                                    ? 'bg-eco-primary-700 text-white'
                                    : 'bg-gradient-to-r from-eco-primary-600 to-eco-primary-500 text-white hover:to-eco-primary-400 hover:-translate-y-0.5'
                                    }`}
                            >
                                Registrarse
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
