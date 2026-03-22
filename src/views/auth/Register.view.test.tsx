import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register.view';
import { authService } from '../../services/authService';

vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key: string) => key, language: 'es' })
}));

vi.mock('../../services/authService', () => ({
    authService: {
        register: vi.fn(),
    }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => mockNavigate,
    };
});

describe('Register View', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderRegister = () => {
        return render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );
    };

    it('renders the register form', () => {
        renderRegister();
        expect(screen.getByText('auth.register.title')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('auth.register.placeholderName')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('auth.login.placeholderEmail')).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', async () => {
        const { container } = renderRegister();
        // Fire submit on the form directly to bypass native HTML required validation
        const form = container.querySelector('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(screen.getByText('auth.register.validation.nameRequired')).toBeInTheDocument();
            expect(screen.getByText('auth.register.validation.emailRequired')).toBeInTheDocument();
            expect(screen.getByText('auth.register.validation.passwordRequired')).toBeInTheDocument();
        });
        expect(authService.register).not.toHaveBeenCalled();
    });

    it('shows error for mismatched passwords', async () => {
        renderRegister();
        fireEvent.change(screen.getByPlaceholderText('auth.register.placeholderName'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('auth.login.placeholderEmail'), { target: { value: 'john@example.com' } });
        
        const passwordInputs = screen.getAllByPlaceholderText('auth.login.placeholderPassword');
        fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'different123' } });

        const form = document.querySelector('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(screen.getByText('auth.register.validation.passwordMismatch')).toBeInTheDocument();
        });
    });

    it('registers user and shows confirmation modal', async () => {
        vi.mocked(authService.register).mockResolvedValueOnce({ user: { name: 'John Due' } } as any);
        renderRegister();

        fireEvent.change(screen.getByPlaceholderText('auth.register.placeholderName'), { target: { value: 'John Due' } });
        fireEvent.change(screen.getByPlaceholderText('auth.login.placeholderEmail'), { target: { value: 'john@example.com' } });
        
        const passwordInputs = screen.getAllByPlaceholderText('auth.login.placeholderPassword');
        fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

        const form = document.querySelector('form');
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(screen.getByText('¡Registro Exitoso!')).toBeInTheDocument();
            expect(screen.getByText('auth.register.success')).toBeInTheDocument();
        });

        // Click on "Ir al Inicio" to confirm navigate
        fireEvent.click(screen.getByText('Ir al Inicio'));
        expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
});
