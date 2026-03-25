import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import DestinationModal from './DestinationModal';
import { authService } from '../../services/authService';

vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key: string) => key, language: 'es' })
}));
vi.mock('../../translations/places', () => ({
    getTranslatedPlace: (place: any) => place
}));
vi.mock('../../utils/imageUtils', () => ({
    getOptimizedImageUrl: (url: string) => url
}));

vi.mock('../../services/authService', () => ({
    authService: {
        getCurrentUser: vi.fn(),
    }
}));
vi.mock('../../services/placesService', () => ({
    placesService: {
        getFavorites: vi.fn().mockResolvedValue([]),
        addFavorite: vi.fn(),
        removeFavorite: vi.fn(),
        createReview: vi.fn(),
        getOne: vi.fn(),
    }
}));

const mockPlace = {
    id: 1,
    name: 'Laguna del Otún',
    description: 'Descripción completa aquí...',
    short_description: 'Breve',
    category: { name: 'Naturaleza' },
    images: [{ id: 1, image_path: 'http://example.com/img.jpg' }],
    reviews: []
} as any;

describe('DestinationModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderModal = (isOpen = true) => {
        return render(
            <MemoryRouter>
                <DestinationModal destination={mockPlace} isOpen={isOpen} onClose={vi.fn()} />
            </MemoryRouter>
        );
    };

    it('returns null if isOpen is false', () => {
        const { container } = renderModal(false);
        expect(container.firstChild).toBeNull();
    });

    it('renders unauthenticated state asking to login', () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue(null);
        renderModal();

        expect(screen.getByText('Laguna del Otún')).toBeInTheDocument();
        // Should show the blur overlay / CTA for non-logged in users
        expect(screen.getByText('¿Quieres ver más detalles?')).toBeInTheDocument();
    });

    it('renders tabs for authenticated users', async () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, name: 'User', role: 'user' } as any);
        renderModal();

        // Tabs should be visible
        await waitFor(() => {
            expect(screen.getByText('home.modal.tabs.info')).toBeInTheDocument();
            expect(screen.getByText('home.modal.tabs.reviews')).toBeInTheDocument();
        });
    });

    it('switches to reviews tab when clicked', async () => {
        vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, name: 'User', role: 'user' } as any);
        renderModal();

        fireEvent.click(screen.getByText('home.modal.tabs.reviews'));

        await waitFor(() => {
            // Check if rating string or element from reviews tab info is present
            expect(screen.getByText('home.modal.reviews.title')).toBeInTheDocument();
        });
    });
});
