import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import { authService } from '../../services/authService';

// Mock authService
vi.mock('../../services/authService', () => ({
    authService: {
        register: vi.fn(),
    },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock window.alert
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderRegister = () => {
        return render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
    };

    it('renders register form correctly', () => {
        renderRegister();

        expect(screen.getByRole('heading', { name: /Crear Cuenta/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/^Contraseña$/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Confirmar Contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Registrarse/i })).toBeInTheDocument();
    });

    it('shows validation error when fields are empty', async () => {
        const { container } = renderRegister();
        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(screen.getByText('El nombre es requerido')).toBeInTheDocument();
            expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument();
            expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
        });
        expect(authService.register).not.toHaveBeenCalled();
    });

    it('shows validation error for invalid email and short password', async () => {
        const { container } = renderRegister();

        fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'invalid-email' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: '123' } });
        // The password confirmation state will also throw an error because it doesn't match 123 vs ''
        
        fireEvent.submit(container.querySelector('form')!);

        await waitFor(() => {
            expect(screen.getByText('El correo electrónico no es válido')).toBeInTheDocument();
            expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument();
        });
    });

    it('shows validation error when passwords do not match', async () => {
        renderRegister();

        fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'differentspassword' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

        await waitFor(() => {
            expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
        });
    });

    it('handles successful registration and navigates to login', async () => {
        const mockResponse = { user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' }, token: 'mock-token' };
        vi.mocked(authService.register).mockResolvedValueOnce(mockResponse as any);

        renderRegister();

        fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

        await waitFor(() => {
            expect(authService.register).toHaveBeenCalledWith({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                password_confirmation: 'password123'
            });
            expect(mockAlert).toHaveBeenCalledWith('¡Bienvenido Test User! Tu cuenta ha sido creada exitosamente.');
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('handles registration failure and displays general error', async () => {
        vi.mocked(authService.register).mockRejectedValueOnce(new Error('El correo ya existe'));

        renderRegister();

        fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/^Contraseña$/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/Confirmar Contraseña/i), { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByRole('button', { name: /Registrarse/i }));

        await waitFor(() => {
            expect(screen.getByText('El correo ya existe')).toBeInTheDocument();
        });
    });
});
