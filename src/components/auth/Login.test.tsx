import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { authService } from '../../services/authService';

// Mock authService
vi.mock('../../services/authService', () => ({
    authService: {
        login: vi.fn(),
    },
}));

// Mock window.alert
const mockAlert = vi.spyOn(window, 'alert').mockImplementation(() => {});

describe('Login Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    const renderLogin = () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );
    };

    it('renders login form correctly', () => {
        renderLogin();

        expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    });

    it('updates input values on change', () => {
        renderLogin();

        const emailInput = screen.getByLabelText(/Correo Electrónico/i);
        const passwordInput = screen.getByLabelText(/Contraseña/i);

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    it('handles successful login', async () => {
        const mockResponse = { user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' }, token: 'mock-token' };
        vi.mocked(authService.login).mockResolvedValueOnce(mockResponse as any);

        renderLogin();

        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: 'password',
                remember: false
            });
            expect(mockAlert).toHaveBeenCalledWith('¡Bienvenido Test User!');
        });
    });

    it('handles login failure and displays error message', async () => {
        vi.mocked(authService.login).mockRejectedValueOnce(new Error('Credenciales inválidas'));

        renderLogin();

        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

        await waitFor(() => {
            expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
        });
    });

    it('saves email to localStorage if remember me is checked', async () => {
        const mockResponse = { user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'user' }, token: 'mock-token' };
        vi.mocked(authService.login).mockResolvedValueOnce(mockResponse as any);

        renderLogin();

        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'password' } });
        
        const rememberCheckbox = screen.getByLabelText(/Recordarme/i);
        fireEvent.click(rememberCheckbox);
        
        fireEvent.click(screen.getByRole('button', { name: /Iniciar Sesión/i }));

        await waitFor(() => {
            expect(localStorage.getItem('remembered_email')).toBe('test@example.com');
        });
    });

    it('loads remembered email on mount', () => {
        localStorage.setItem('remembered_email', 'remembered@example.com');
        renderLogin();

        expect(screen.getByLabelText(/Correo Electrónico/i)).toHaveValue('remembered@example.com');
        expect(screen.getByLabelText(/Recordarme/i)).toBeChecked();
    });
});
