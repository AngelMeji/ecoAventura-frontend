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
        <header className="bg-white border-b border-gray-200 sticky top-0 z-[9999] shadow-sm">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                <Link
                    to="/home"
                    onClick={(e) => {
                        if (location.pathname === '/home') {
                            e.preventDefault();
                            window.location.reload();
                        }
                    }}
                >
                    <Logo />
                </Link>

                <div className="flex gap-3 items-center">
                    <Link
                        to="/home"
                        onClick={(e) => {
                            if (location.pathname === '/home') {
                                e.preventDefault();
                                window.location.reload();
                            }
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/home')
                            ? 'text-eco-teal-600'
                            : 'text-gray-600 hover:text-eco-teal-600'
                            }`}
                    >
                        Inicio
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/dashboard')
                                    ? 'text-eco-teal-600'
                                    : 'text-gray-600 hover:text-eco-teal-600'
                                    }`}
                            >
                                {user.role === 'admin' ? 'Panel Admin' : (user.role === 'partner' ? 'Panel Socio' : 'Mi Cuenta')}
                            </Link>
                            <div className="h-6 w-px bg-gray-300 mx-2"></div>
                            <span className="text-sm font-medium text-gray-700 hidden md:block">
                                {user?.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-lg font-medium text-red-500 hover:bg-red-50 transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/login')
                                    ? 'text-eco-teal-600'
                                    : 'text-gray-600 hover:text-eco-teal-600'
                                    }`}
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/register"
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isActive('/register')
                                    ? 'bg-eco-teal-500 text-white'
                                    : 'bg-eco-teal-500 text-white hover:bg-eco-teal-600'
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
