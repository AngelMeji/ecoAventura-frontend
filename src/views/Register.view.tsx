import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { RegisterData } from '../models/User.model';

/**
 * Vista de Registro
 */
const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Removed client-side required checks as per user request (backend handles them)

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El correo electrónico no es válido';
        }

        if (formData.password && formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await authService.register(formData);
            console.log('Registration successful:', response);
            alert(`¡Bienvenido ${response.user.name}! Tu cuenta ha sido creada exitosamente.`);
            navigate('/home'); // Redirigir al Home tras registro exitoso
        } catch (err: any) {
            setErrors({
                general: err.message || 'Error al registrar',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
            // Redirigir al home por defecto (los usuarios nuevos son 'user')
            window.location.href = '/home';
        }
    };

    return (
        <div className="auth-card backdrop-blur-xl bg-white/90">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-eco-primary-500 to-eco-primary-700 rounded-2xl shadow-lg flex items-center justify-center transform hover:scale-105 duration-300">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
            </div>

            <h2 className="text-3xl font-display font-bold text-center text-gray-800 mb-2">
                Crear Cuenta
            </h2>
            <p className="text-center text-gray-500 mb-8 font-light">
                Únete a la comunidad de EcoTurismo
            </p>

            {errors.general && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r shadow-sm mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {errors.general}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1 pl-1">
                        Nombre Completo
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Tu nombre"
                        className={`auth-input focus:ring-2 focus:ring-eco-primary-500/20 ${errors.name ? 'border-red-500 ring-2 ring-red-100' : ''}`}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.name}</p>}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1 pl-1">
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="tu@email.com"
                        className={`auth-input focus:ring-2 focus:ring-eco-primary-500/20 ${errors.email ? 'border-red-500 ring-2 ring-red-100' : ''}`}
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.email}</p>}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1 pl-1">
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`auth-input focus:ring-2 focus:ring-eco-primary-500/20 ${errors.password ? 'border-red-500 ring-2 ring-red-100' : ''}`}
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.password}</p>}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-bold text-gray-700 mb-1 pl-1">
                        Confirmar Contraseña
                    </label>
                    <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`auth-input focus:ring-2 focus:ring-eco-primary-500/20 ${errors.password_confirmation ? 'border-red-500 ring-2 ring-red-100' : ''}`}
                    />
                    {errors.password_confirmation && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1"><svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.password_confirmation}</p>
                    )}
                </div>

                <button type="submit" disabled={loading} className="auth-button disabled:opacity-70 disabled:cursor-not-allowed mt-6 transform active:scale-95 duration-200">
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Registrando...
                        </span>
                    ) : 'Registrarse'}
                </button>
            </form>

            <p className="text-center text-gray-600 mt-8 text-sm">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="auth-link font-bold hover:underline">
                    Inicia sesión
                </Link>
            </p>
        </div>
    );
};

export default Register;
