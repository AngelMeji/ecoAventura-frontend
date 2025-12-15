import axios, { AxiosError } from 'axios';
import type { LoginCredentials, RegisterData, AuthResponse, User, AuthError } from '../models/User.model';

// URL base de la API desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configuración de la instancia de Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Importante para recibir errores JSON de Laravel
    },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para manejar errores globales (401 Unauthorized, 403 Forbidden)
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Si el token expiró o no es válido, cerrar sesión
            authService.logout();
            window.location.href = '/login';
        }
        if (error.response?.status === 403) {
            // Sin permisos para esta acción
            console.warn('Acceso denegado: No tienes permisos para realizar esta acción');
            // Opcional: redirigir al dashboard o mostrar mensaje
        }
        return Promise.reject(error);
    }
);

export const authService = {
    // Iniciar sesión
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/login', credentials);

            // Guardar token y usuario si la respuesta es exitosa
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            if (axios.isAxiosError(error) && error.response?.data) {
                throw error.response.data as AuthError;
            }
            throw new Error('Error de conexión con el servidor');
        }
    },

    // Registrar usuario
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await api.post<AuthResponse>('/register', data);

            // Auto-login al registrarse (si el backend devuelve token)
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }

            return response.data;
        } catch (error) {
            console.error('Register error:', error);
            if (axios.isAxiosError(error) && error.response?.data) {
                throw error.response.data as AuthError;
            }
            throw new Error('Error al registrar usuario');
        }
    },

    // Cerrar sesión
    async logout(): Promise<void> {
        try {
            await api.post('/logout'); // Invalida el token en backend
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Limpia sesión local independientemente del error en backend
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    },

    // Obtener usuario actual desde el backend (validar token)
    async getProfile(): Promise<User> {
        const response = await api.get<User>('/me');
        localStorage.setItem('user', JSON.stringify(response.data)); // Actualizar cache local
        return response.data;
    },

    // Actualizar perfil
    async updateProfile(data: Partial<User> | FormData): Promise<User> {
        // Separar lógica si es multipart (avatar) o JSON (datos)
        if (data instanceof FormData) {
            // Endpoint específico para avatar
            const response = await api.post<User>('/profile/avatar', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            localStorage.setItem('user', JSON.stringify(response.data));
            return response.data;
        } else {
            // Endpoint para datos básicos
            const response = await api.put<User>('/profile', data);
            localStorage.setItem('user', JSON.stringify(response.data));
            return response.data;
        }
    },

    // Actualizar contraseña
    async updatePassword(data: { current_password: string; password: string; password_confirmation: string }): Promise<void> {
        await api.put('/profile/password', data);
    },

    // Métodos auxiliares locales
    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    },

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

export default api; // Exportamos la instancia de axios por si se necesita en otros servicios
