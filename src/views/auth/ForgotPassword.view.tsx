import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await authService.forgotPassword(email);
            setStatus('success');
            setMessage(response.message || 'Enlace de recuperación enviado. Revisa tu correo.');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Error al enviar el enlace.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
                <div className="bg-eco-primary-600 p-8 text-center">
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Recuperar Contraseña</h2>
                    <p className="text-eco-primary-100">Ingresa tu correo para recibir un enlace de restablecimiento.</p>
                </div>

                <div className="p-8">
                    {status === 'success' ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                                ✓
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">¡Correo Enviado!</h3>
                            <p className="text-gray-600">{message}</p>
                            <Link to="/login" className="inline-block mt-4 text-eco-primary-600 font-bold hover:underline">
                                Volver al inicio de sesión
                            </Link>
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
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-eco-primary-500 focus:ring-2 focus:ring-eco-primary-200 transition-all outline-none"
                                    placeholder="ejemplo@correo.com"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full py-3 bg-eco-primary-600 text-white rounded-xl font-bold shadow-lg shadow-eco-primary-600/30 hover:bg-eco-primary-700 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? 'Enviando...' : 'Enviar Enlace'}
                            </button>

                            <div className="text-center mt-4">
                                <Link to="/login" className="text-sm text-gray-500 hover:text-eco-primary-600 font-medium transition-colors">
                                    ← Volver al inicio de sesión
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
