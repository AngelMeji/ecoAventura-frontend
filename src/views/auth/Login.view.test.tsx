import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login.view';
import { authService } from '../../services/authService';

vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key: string) => key, language: 'es' })
}));

vi.mock('../../services/authService', () => ({
    authService: {
        login: vi.fn(),
    }
}));

describe('Login View', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.location.href
        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { href: '' },
        });
    });

    const renderLogin = () => {
        return render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
    };

    it('renders the login form', () => {
        renderLogin();
        expect(screen.getByText('auth.login.title')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('auth.login.placeholderEmail')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('auth.login.placeholderPassword')).toBeInTheDocument();
    });

    it('shows error if login fails', async () => {
        vi.mocked(authService.login).mockRejectedValueOnce({ message: 'Invalid credentials' });
        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('auth.login.placeholderEmail'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('auth.login.placeholderPassword'), { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByText('auth.login.submit'));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });

    it('redirects user to /home on successful user login', async () => {
        vi.mocked(authService.login).mockResolvedValueOnce({ user: { role: 'user' } } as any);
        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('auth.login.placeholderEmail'), { target: { value: 'user@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('auth.login.placeholderPassword'), { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByText('auth.login.submit'));

        await waitFor(() => {
            expect(window.location.href).toBe('/home');
        });
    });

    it('redirects admin to /dashboard on successful admin login', async () => {
        vi.mocked(authService.login).mockResolvedValueOnce({ user: { role: 'admin' } } as any);
        renderLogin();

        fireEvent.change(screen.getByPlaceholderText('auth.login.placeholderEmail'), { target: { value: 'admin@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('auth.login.placeholderPassword'), { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByText('auth.login.submit'));

        await waitFor(() => {
            expect(window.location.href).toBe('/dashboard');
        });
    });
});
