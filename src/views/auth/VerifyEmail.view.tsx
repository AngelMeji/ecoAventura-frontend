import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verificando tu correo electrónico...');

    useEffect(() => {
        const verify = async () => {
            // Reconstruct the full URL from the query params to send to the backend
            // The backend signed route looks like: /api/email/verify/{id}/{hash}?expires=...&signature=...
            const id = searchParams.get('id');
            const hash = searchParams.get('hash');
            const expires = searchParams.get('expires');
            const signature = searchParams.get('signature');

            if (!id || !hash || !expires || !signature) {
                setStatus('error');
                setMessage('Enlace de verificación inválido o incompleto.');
                return;
            }

            const url = `/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`;

            try {
                const response = await authService.verifyEmail(url);
                setStatus('success');
                setMessage(response.message || '¡Correo verificado con éxito!');
            } catch (error: any) {
                setStatus('error');
                setMessage(error.message || 'No se pudo verificar el correo. El enlace puede haber expirado.');
            }
        };

        verify();
    }, [searchParams]);

    return (
        <div className="auth-card max-w-md w-full mx-auto p-8 bg-white rounded-2xl shadow-xl text-center">
            <div className="flex justify-center mb-6">
                {status === 'verifying' && (
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                {status === 'success' && (
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                )}
                {status === 'error' && (
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center shadow-inner">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                )}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {status === 'verifying' ? 'Verificando...' : (status === 'success' ? '¡Verificado!' : 'Error de Verificación')}
            </h2>
            
            <p className={`mb-6 ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                {message}
            </p>

            {status !== 'verifying' && (
                <div className="mt-6">
                    <Link 
                        to="/login" 
                        className="w-full inline-block bg-eco-primary-500 text-white font-semibold py-3 rounded-xl hover:bg-eco-primary-600 transition duration-300"
                    >
                        Ir a Iniciar Sesión
                    </Link>
                </div>
            )}
        </div>
    );
};

export default VerifyEmail;
