import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';
import type { RegisterData } from '../../types/auth';

const Register: React.FC = () => {
    const { t } = useLanguage();
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

        if (!formData.name.trim()) {
            newErrors.name = t('auth.register.validation.nameRequired');
        }

        if (!formData.email.trim()) {
            newErrors.email = t('auth.register.validation.emailRequired');
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = t('auth.register.validation.emailInvalid');
        }

        if (!formData.password) {
            newErrors.password = t('auth.register.validation.passwordRequired');
        } else {
            const password = formData.password;
            if (password.length < 8 || password.length > 12) {
                newErrors.password = t('auth.register.validation.passwordMin');
            } else if (!/[A-Z]/.test(password)) {
                newErrors.password = t('auth.register.validation.passwordUpper');
            } else if (!/[a-z]/.test(password)) {
                newErrors.password = t('auth.register.validation.passwordLower');
            } else if (!/\d/.test(password)) {
                newErrors.password = t('auth.register.validation.passwordNumber');
            } else if (!/[\W_]/.test(password)) {
                newErrors.password = t('auth.register.validation.passwordSymbol');
            }
        }

        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = t('auth.register.validation.passwordMismatch');
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

            alert(`¡Bienvenido ${response.user.name}! Tu cuenta ha sido creada exitosamente.`);
            navigate('/login');
        } catch (err) {
            setErrors({
                general: err instanceof Error ? err.message : 'Error al registrar',
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
        // Clear error for this field when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: '',
            });
        }
    };

    return (
        <div className="auth-card">
            {/* Logo Icon */}
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-eco-teal-500 rounded-full flex items-center justify-center">
                    <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                        />
                    </svg>
                </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {t('auth.register.title')}
            </h2>
            <p className="text-center text-gray-600 mb-6">
                {t('auth.register.subtitle')}
            </p>

            {/* General Error Message */}
            {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {errors.general}
                </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.register.name')}
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('auth.register.placeholderName')}
                        required
                        className={`auth-input ${errors.name ? 'border-red-500' : ''}`}
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.login.email')}
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('auth.login.placeholderEmail')}
                        required
                        className={`auth-input ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.login.password')}
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t('auth.login.placeholderPassword')}
                        required
                        className={`auth-input ${errors.password ? 'border-red-500' : ''}`}
                    />
                    {errors.password && (
                        <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.register.confirmPassword')}
                    </label>
                    <input
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={formData.password_confirmation}
                        onChange={handleChange}
                        placeholder={t('auth.login.placeholderPassword')}
                        required
                        className={`auth-input ${errors.password_confirmation ? 'border-red-500' : ''}`}
                    />
                    {errors.password_confirmation && (
                        <p className="mt-1 text-sm text-red-600">{errors.password_confirmation}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="auth-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? t('auth.register.loading') : t('auth.register.submit')}
                </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-gray-600 mt-6">
                {t('auth.register.hasAccount')}{' '}
                <Link to="/login" className="auth-link">
                    {t('auth.register.login')}
                </Link>
            </p>
        </div>
    );
};

export default Register;
