import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ForgotPassword from './ForgotPassword.view';
import { authService } from '../../services/authService';

vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key: string) => key, language: 'es' })
}));

vi.mock('../../services/authService', () => ({
    authService: {
        forgotPassword: vi.fn(),
    }
}));

describe('ForgotPassword View', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderView = () => {
        return render(
            <MemoryRouter>
                <ForgotPassword />
            </MemoryRouter>
        );
    };

    it('renders the form correctly', () => {
        renderView();
        expect(screen.getByText('auth.forgotPassword.title')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('auth.login.placeholderEmail')).toBeInTheDocument();
    });

    it('shows success message when request succeeds', async () => {
        vi.mocked(authService.forgotPassword).mockResolvedValueOnce({ message: 'Success email sent' });
        renderView();

        fireEvent.change(screen.getByPlaceholderText('auth.login.placeholderEmail'), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByText('auth.forgotPassword.submit'));

        await waitFor(() => {
            expect(screen.getByText('auth.forgotPassword.successTitle')).toBeInTheDocument();
            expect(screen.getByText('Success email sent')).toBeInTheDocument();
        });
    });

    it('shows error message when request fails', async () => {
        vi.mocked(authService.forgotPassword).mockRejectedValueOnce({ response: { data: { message: 'User not found' } } });
        renderView();

        fireEvent.change(screen.getByPlaceholderText('auth.login.placeholderEmail'), { target: { value: 'test@example.com' } });
        fireEvent.click(screen.getByText('auth.forgotPassword.submit'));

        await waitFor(() => {
            expect(screen.getByText('User not found')).toBeInTheDocument();
        });
    });
});
