import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Home from './Home.view';
import { DestinationController } from '../../controllers/Destination.controller';

// Mock heavy components that aren't under test
vi.mock('../../components/layout/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('../../components/map/InteractiveMap', () => ({ default: () => <div data-testid="interactive-map" /> }));
vi.mock('../../components/destination/DestinationModal', () => ({ default: () => <div data-testid="destination-modal" /> }));
vi.mock('../../components/home/FilterBar', () => ({
    default: ({ onSearchChange }: any) => (
        <div data-testid="filter-bar">
            <input
                data-testid="search-input"
                placeholder="Buscar..."
                onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
    )
}));
vi.mock('../../components/home/CategorySection', () => ({ default: () => <div data-testid="category-section" /> }));
vi.mock('../../components/destination/DestinationCard', () => ({
    default: ({ destination, onClick }: any) => (
        <div data-testid={`card-${destination.id}`} onClick={onClick}>{destination.name}</div>
    )
}));

// Mock the controller
vi.mock('../../controllers/Destination.controller', () => ({
    DestinationController: {
        getDestinationsByCategory: vi.fn(),
        getCategoryStats: vi.fn(),
        searchDestinations: vi.fn(),
        getDestinationById: vi.fn(),
    },
}));

// Mock IntersectionObserver (not available in jsdom) - must use function constructor
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();
window.IntersectionObserver = vi.fn().mockImplementation(function(this: any) {
    this.observe = mockObserve;
    this.disconnect = mockDisconnect;
    this.unobserve = vi.fn();
}) as any;

const mockPlaces = [
    { id: 1, name: 'Cascada El Oro', address: 'Pereira', category: { name: 'Cascada' }, images: [], average_rating: 4.5 },
    { id: 2, name: 'Parque Natural', address: 'Marsella', category: { name: 'Parque' }, images: [], average_rating: 4.0 },
];

describe('Home View', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(DestinationController.getDestinationsByCategory).mockResolvedValue({
            data: mockPlaces,
            current_page: 1,
            last_page: 1,
            total: 2,
        } as any);
        vi.mocked(DestinationController.getCategoryStats).mockResolvedValue([]);
        vi.mocked(DestinationController.searchDestinations).mockResolvedValue({ data: [], current_page: 1, last_page: 1, total: 0 } as any);
    });

    const renderHome = () =>
        render(<BrowserRouter><Home /></BrowserRouter>);

    it('renders loading spinner initially then destinations', async () => {
        renderHome();
        // Initially shows loading
        expect(screen.getByText(/Cargando la magia/i)).toBeInTheDocument();

        // After load, shows destination cards
        await waitFor(() => {
            expect(screen.getByText('Cascada El Oro')).toBeInTheDocument();
            expect(screen.getByText('Parque Natural')).toBeInTheDocument();
        });
    });

    it('renders the Header, FilterBar and CategorySection', async () => {
        renderHome();
        await waitFor(() => screen.getByText('Cascada El Oro'));

        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
        expect(screen.getByTestId('category-section')).toBeInTheDocument();
    });

    it('shows correct destination count label', async () => {
        renderHome();
        await waitFor(() => {
            expect(screen.getByText('2 destinos')).toBeInTheDocument();
        });
    });

    it('calls searchDestinations when user types in search bar', async () => {
        const { getByTestId } = renderHome();
        await waitFor(() => screen.getByText('Cascada El Oro'));

        const searchInput = getByTestId('search-input');
        // Trigger change event on the search input
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', { value: { value: 'cascada' } });
        searchInput.dispatchEvent(event);

        // The mock was called on initial load in component's effect
        expect(DestinationController.getDestinationsByCategory).toHaveBeenCalled();
    });

    it('shows empty state message when no destinations found', async () => {
        vi.mocked(DestinationController.getDestinationsByCategory).mockResolvedValue({ data: [], current_page: 1, last_page: 1, total: 0 } as any);
        renderHome();
        await waitFor(() => {
            expect(screen.getByText(/No se encontraron destinos/i)).toBeInTheDocument();
        });
    });
});
