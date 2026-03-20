import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { authService } from '../../services/authService';
import type { LoginCredentials } from '../../models/User.model';
import { GoogleLogin } from '@react-oauth/google';

/**
 * Vista de Login
 */
const Login: React.FC = () => {
    const { t } = useLanguage();
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
            setError(err.message || t('auth.login.error'));
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

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) {
            setError(t('auth.login.googleError'));
            return;
        }

        setError('');
        setLoading(true);

        try {
            const response = await authService.googleLogin(credentialResponse.credential);
            if (response.user.role === 'admin' || response.user.role === 'partner') {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/home';
            }
        } catch (err: any) {
            setError(err.message || t('auth.login.googleError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-eco-primary-500 to-eco-primary-700 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {t('auth.login.title')}
            </h2>
            <p className="text-center text-gray-600 mb-6">
                {t('auth.login.subtitle')}
            </p>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="mb-6 flex justify-center w-full">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        setError(t('auth.login.googleError'));
                    }}
                    text="continue_with"
                    width="100%"
                />
            </div>

            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                        {t('auth.login.orDivider') || 'o'}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.login.email')}
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={credentials.email}
                        onChange={handleChange}
                        placeholder={t('auth.login.placeholderEmail')}
                        required
                        className="auth-input"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        {t('auth.login.password')}
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={credentials.password}
                        onChange={handleChange}
                        placeholder={t('auth.login.placeholderPassword')}
                        required
                        className="auth-input"
                    />
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                        <input type="checkbox" className="w-4 h-4 text-eco-teal-500 border-gray-300 rounded focus:ring-eco-teal-500" />
                        <span className="ml-2 text-gray-600">{t('auth.login.rememberMe')}</span>
                    </label>
                    <a href="/forgot-password" className="auth-link text-sm">
                        {t('auth.login.forgotPassword')}
                    </a>
                </div>

                <button type="submit" disabled={loading} className="auth-button disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? t('auth.login.loading') : t('auth.login.submit')}
                </button>
            </form>

            <p className="text-center text-gray-600 mt-6">
                {t('auth.login.noAccount')}{' '}
                <Link to="/register" className="auth-link">
                    {t('auth.login.register')}
                </Link>
            </p>
        </div>
    );
};

export default Login;