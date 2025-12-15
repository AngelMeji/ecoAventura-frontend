import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { authService } from '../../services/authService';

const Header: React.FC = () => {
    const location = useLocation();
    const user = authService.getCurrentUser();
    const isAuthenticated = !!user;
    const [scrolled, setScrolled] = useState(false);

    // Rutas donde el header NO debe ser fixed (admin/partner panels)
    const isPanelRoute = ['/dashboard', '/bg-admin', '/places/create', '/places/edit'].some(path => location.pathname.startsWith(path)) || location.pathname.includes('/profile');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        <header
            className={`${isPanelRoute ? 'absolute' : 'fixed'} top-0 w-full z-[9999] transition-all duration-300 border-b ${!isPanelRoute && scrolled
                    ? 'bg-white/90 backdrop-blur-md border-gray-200 shadow-sm py-3'
                    : 'bg-white/50 backdrop-blur-sm border-transparent py-5'
                } ${isPanelRoute ? 'bg-white border-b border-gray-100' : ''}`}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link
                    to="/home"
                    className="text-2xl font-bold font-display text-eco-primary-700 tracking-tight hover:text-eco-primary-800 transition-colors"
                >
                    EcoAventura
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
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isActive('/home')
                            ? 'text-eco-primary-700 bg-eco-primary-50'
                            : 'text-gray-600 hover:text-eco-primary-600 hover:bg-gray-50'
                            }`}
                    >
                        Inicio
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/dashboard"
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${isActive('/dashboard')
                                    ? 'text-eco-primary-700 bg-eco-primary-50'
                                    : 'text-gray-600 hover:text-eco-primary-600 hover:bg-gray-50'
                                    }`}
                            >
                                {user.role === 'admin' ? 'Panel Admin' : (user.role === 'partner' ? 'Panel Socio' : 'Mi Cuenta')}
                            </Link>
                            <div className="h-6 w-px bg-gray-200 mx-2"></div>
                            <span className="text-sm font-medium text-eco-primary-800 hidden md:block">
                                {user?.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 rounded-full font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-300"
                            >
                                Cerrar Sesión
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${isActive('/login')
                                    ? 'text-eco-primary-700 bg-eco-primary-50'
                                    : 'text-gray-600 hover:text-eco-primary-600 hover:bg-gray-50'
                                    }`}
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/register"
                                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${isActive('/register')
                                    ? 'bg-eco-primary-600 text-white'
                                    : 'bg-gradient-to-r from-eco-primary-600 to-eco-primary-700 text-white hover:from-eco-primary-700 hover:to-eco-primary-800'
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
