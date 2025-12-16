import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const ResetPassword: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // El token y email suelen venir en la URL desde el correo
    const token = searchParams.get('token') || '';
    const emailParam = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailParam);
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            setStatus('error');
            setMessage('Las contraseñas no coinciden.');
            return;
        }

        setStatus('loading');
        setMessage('');

        try {
            await authService.resetPassword({
                token,
                email,
                password,
                password_confirmation: passwordConfirmation
            });
            setStatus('success');
            setMessage('Contraseña restablecida correctamente.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error al restablecer la contraseña.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
                <div className="bg-eco-primary-600 p-8 text-center">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Nueva Contraseña</h2>
                    <p className="text-eco-primary-100">Crea una nueva contraseña segura para tu cuenta.</p>
                </div>

                <div className="p-8">
                    {status === 'success' ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                                ✓
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">¡Éxito!</h3>
                            <p className="text-gray-600">{message}</p>
                            <p className="text-sm text-gray-400">Redirigiendo al login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {status === 'error' && (
                                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm text-center font-medium border border-red-100">
                                    {message}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all outline-none"
                                    placeholder="ejemplo@correo.com"
                                    required
                                    readOnly={!!emailParam} // Readonly si viene de la URL
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Nueva Contraseña</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all outline-none"
                                    placeholder="********"
                                    required
                                    minLength={8}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all outline-none"
                                    placeholder="********"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-3 bg-eco-primary-600 text-white rounded-xl font-bold shadow-lg shadow-eco-primary-600/30 hover:bg-eco-primary-700 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? 'Restableciendo...' : 'Restablecer Contraseña'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
