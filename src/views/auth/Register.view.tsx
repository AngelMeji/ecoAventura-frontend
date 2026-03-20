import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import type { RegisterData } from '../../models/User.model';
import { GoogleLogin } from '@react-oauth/google';

/**
 * Vista de Registro
 */
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
    const [isRegistered, setIsRegistered] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendMessage, setResendMessage] = useState('');
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string }>({
        isOpen: false,
        title: '',
        message: ''
    });

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
        } else if (formData.password.length < 6) {
            newErrors.password = t('auth.register.validation.passwordMin');
        }

        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = t('auth.register.validation.passwordMismatch');
        } else if (formData.password.length > 12) {
            newErrors.password = t('auth.register.validation.passwordMax');
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
            await authService.register(formData);
            setIsRegistered(true);
        } catch (err: any) {
            setErrors({
                general: err.message || t('auth.register.error'),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setResendMessage('');
        try {
            const response = await authService.resendVerification(formData.email);
            setResendMessage(response.message);
        } catch (err: any) {
            setErrors({ general: err.message });
        } finally {
            setResending(false);
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
        }
    };

    const handleGoogleSuccess = async (credentialResponse: any) => {
        if (!credentialResponse.credential) {
            setErrors({ general: t('auth.login.googleError') });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const response = await authService.googleLogin(credentialResponse.credential);
            setConfirmModal({
                isOpen: true,
                title: '¡Registro Exitoso!',
                message: t('auth.register.success').replace('{name}', response.user.name)
            });
        } catch (err: any) {
            setErrors({
                general: err.message || t('auth.login.googleError'),
            });
        } finally {
            setLoading(false);
        }
    };

    if (isRegistered) {
        return (
            <div className="auth-card max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center shadow-inner">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Revisa tu correo</h2>
                <p className="text-gray-600 mb-6">
                    Te hemos enviado un enlace de confirmación a <br/>
                    <strong className="text-gray-900">{formData.email}</strong>. <br/><br/>
                    Por favor, haz clic en el enlace para activar tu cuenta. No podrás iniciar sesión hasta que lo hagas.
                </p>
                
                {errors.general && (
                    <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                        {errors.general}
                    </div>
                )}
                
                {resendMessage && (
                    <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-sm">
                        {resendMessage}
                    </div>
                )}

                <button 
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full bg-blue-50 text-blue-600 font-semibold py-3 rounded-xl hover:bg-blue-100 transition duration-300 disabled:opacity-50"
                >
                    {resending ? 'Enviando...' : 'Reenviar correo'}
                </button>
                <div className="mt-6">
                    <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">Volver a Inicio de Sesión</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-card">
            <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-eco-primary-500 to-eco-primary-700 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {t('auth.register.title')}
            </h2>
            <p className="text-center text-gray-600 mb-6">
                {t('auth.register.subtitle')}
            </p>

            {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {errors.general}
                </div>
            )}

            <div className="mb-6 flex justify-center w-full">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => {
                        setErrors({ general: t('auth.login.googleError') });
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
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
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
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
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
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
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

                <button type="submit" disabled={loading} className="auth-button disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? t('auth.register.loading') : t('auth.register.submit')}
                </button>
            </form>

            <p className="text-center text-gray-600 mt-6">
                {t('auth.register.hasAccount')}{' '}
                <Link to="/login" className="auth-link">
                    {t('auth.register.login')}
                </Link>
            </p>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title={confirmModal.title}
                message={confirmModal.message}
                type="success"
                confirmText="Ir al Inicio"
                cancelText="Cerrar"
                onConfirm={() => navigate('/home')}
                onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            />
        </div>
    );
};

export default Register;
