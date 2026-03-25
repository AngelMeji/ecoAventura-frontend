import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResetPassword from './ResetPassword.view';
import { authService } from '../../services/authService';

vi.mock('../../services/authService', () => ({
    authService: {
        resetPassword: vi.fn(),
    }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual as any,
        useNavigate: () => mockNavigate,
        useSearchParams: () => [new URLSearchParams('?token=test-token&email=test@example.com')],
    };
});

describe('ResetPassword View', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderView = () => {
        return render(
            <MemoryRouter>
                <ResetPassword />
            </MemoryRouter>
        );
    };

    it('renders the form with pre-filled email from params', () => {
        renderView();
        const emailInput = screen.getByPlaceholderText('ejemplo@correo.com') as HTMLInputElement;
        expect(emailInput.value).toBe('test@example.com');
        expect(emailInput.readOnly).toBe(true);
    });

    it('shows error if passwords do not match', async () => {
        renderView();
        
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'different123' } });
        
        fireEvent.click(screen.getByText('Restablecer Contraseña'));

        await waitFor(() => {
            expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
        });
    });

    it('shows error if password is too short', async () => {
        renderView();
        
        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        fireEvent.change(passwordInputs[0], { target: { value: 'short' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'short' } });
        
        fireEvent.click(screen.getByText('Restablecer Contraseña'));

        await waitFor(() => {
            expect(screen.getByText('La contraseña debe tener al menos 8 caracteres.')).toBeInTheDocument();
        });
    });

    it('submits successfully and redirects after 3 seconds', async () => {
        vi.mocked(authService.resetPassword).mockResolvedValueOnce({ message: 'Success' });
        renderView();

        const passwordInputs = screen.getAllByPlaceholderText('••••••••');
        fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
        fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
        
        fireEvent.click(screen.getByText('Restablecer Contraseña'));

        await waitFor(() => {
            expect(screen.getByText('¡Éxito!')).toBeInTheDocument();
        });
    });
});
