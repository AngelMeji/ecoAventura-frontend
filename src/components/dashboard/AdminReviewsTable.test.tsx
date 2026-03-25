import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminReviewsTable from './AdminReviewsTable';
import { placesService } from '../../services/placesService';

vi.mock('../../services/placesService', () => ({
    placesService: {
        getAllReviews: vi.fn(),
        toggleHideReview: vi.fn(),
    },
}));

const mockReviews = [
    {
        id: 1,
        rating: 5,
        comment: 'Excelente lugar',
        raw_comment: 'Excelente lugar',
        is_hidden: false,
        created_at: '2024-01-01',
        user: { id: 1, name: 'Ana García', email: 'ana@example.com' },
        place: { id: 1, name: 'Parque Nacional', slug: 'parque-nacional' },
    },
    {
        id: 2,
        rating: 2,
        comment: 'No me gustó',
        raw_comment: 'No me gustó',
        is_hidden: true,
        created_at: '2024-01-02',
        user: { id: 2, name: 'Pedro López', email: 'pedro@example.com' },
        place: { id: 2, name: 'Cascada Verde', slug: 'cascada-verde' },
    },
];

describe('AdminReviewsTable Component', () => {
    const onNotify = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders review rows from initialReviews prop', async () => {
        render(<AdminReviewsTable onNotify={onNotify} initialReviews={mockReviews} />);

        await waitFor(() => {
            expect(screen.getAllByText('Parque Nacional').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Cascada Verde').length).toBeGreaterThan(0);
        });
    });

    it('shows loading state and calls getAllReviews when no initialReviews', async () => {
        vi.mocked(placesService.getAllReviews).mockResolvedValueOnce({ data: mockReviews, current_page: 1, last_page: 1, total: 2 } as any);

        render(<AdminReviewsTable onNotify={onNotify} />);

        expect(screen.getByText('Cargando reseñas...')).toBeInTheDocument();

        await waitFor(() => {
            expect(placesService.getAllReviews).toHaveBeenCalledWith(1);
        });
    });

    it('shows "Visible" status for visible reviews and "Oculto" for hidden', async () => {
        render(<AdminReviewsTable onNotify={onNotify} initialReviews={mockReviews} />);

        await waitFor(() => screen.getAllByText('Parque Nacional'));
        expect(screen.getAllByText('Visible').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Oculto').length).toBeGreaterThan(0);
    });

    it('shows "Ocultar" for visible reviews and "Mostrar" for hidden reviews', async () => {
        render(<AdminReviewsTable onNotify={onNotify} initialReviews={mockReviews} />);

        await waitFor(() => screen.getAllByText('Parque Nacional'));

        // visible review should show 'Ocultar', hidden review should show 'Mostrar'
        expect(screen.getAllByText(/Ocultar/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/Mostrar/).length).toBeGreaterThan(0);
    });

    it('calls toggleHideReview when action button is clicked', async () => {
        vi.mocked(placesService.toggleHideReview).mockResolvedValueOnce({ review: { ...mockReviews[0], is_hidden: true } } as any);

        render(<AdminReviewsTable onNotify={onNotify} initialReviews={mockReviews} />);

        await waitFor(() => screen.getAllByText('Parque Nacional'));

        // Click first action button (which should be "Ocultar" on visible review #1)
        const actionButtons = screen.getAllByText(/Ocultar/);
        fireEvent.click(actionButtons[0]);

        await waitFor(() => {
            expect(placesService.toggleHideReview).toHaveBeenCalledWith(1);
        });
    });

    it('shows empty state message when there are no reviews', async () => {
        render(<AdminReviewsTable onNotify={onNotify} initialReviews={[]} />);
        await waitFor(() => {
            expect(screen.getAllByText('No hay reseñas para moderar.').length).toBeGreaterThan(0);
        });
    });
});
