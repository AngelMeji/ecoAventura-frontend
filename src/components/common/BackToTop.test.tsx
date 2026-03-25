import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BackToTop from './BackToTop';

describe('BackToTop', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock window.scrollTo
        window.scrollTo = vi.fn();
        // Reset scroll position
        window.scrollY = 0;
    });

    const renderWithRouter = (initialRoute = '/') => {
        return render(
            <MemoryRouter initialEntries={[initialRoute]}>
                <BackToTop />
            </MemoryRouter>
        );
    };

    it('does not render on admin routes', () => {
        const { container } = renderWithRouter('/admin/users');
        expect(container.firstChild).toBeNull();
    });

    it('renders but is invisible initially on normal routes', () => {
        renderWithRouter('/places');
        const button = screen.getByLabelText('Volver arriba');
        expect(button).toBeInTheDocument();
        expect(button.className).toContain('opacity-0'); // Using tailwind class logic
    });

    it('calls window.scrollTo when clicked', () => {
        renderWithRouter('/');
        
        // Force state change or simulate visibility (component uses window scroll event which is hard to fire synchronously here, so we just click the element)
        const button = screen.getByLabelText('Volver arriba');
        fireEvent.click(button);

        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });
});
