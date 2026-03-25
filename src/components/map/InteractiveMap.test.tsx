import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import InteractiveMap from './InteractiveMap';

// Mock language context
vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key: string) => key, language: 'es' })
}));

vi.mock('../../translations/places', () => ({
    getTranslatedPlace: (place: any) => place
}));
vi.mock('../../utils/categoryIcons', () => ({
    getCategoryIcon: () => '<svg></svg>'
}));

// Mock react-leaflet
vi.mock('react-leaflet', () => {
    return {
        MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
        TileLayer: () => <div data-testid="tile-layer" />,
        Marker: ({ children, eventHandlers }: any) => (
            <div data-testid="marker" onClick={eventHandlers?.click}>
                {children}
            </div>
        ),
        Tooltip: ({ children }: any) => <div data-testid="tooltip">{children}</div>,
        useMap: () => ({ fitBounds: vi.fn() }),
    };
});

// Mock leaflet
vi.mock('leaflet', () => {
    return {
        default: {
            Icon: { Default: { prototype: {}, mergeOptions: vi.fn() } },
            divIcon: vi.fn(),
            Browser: { mobile: false },
            latLngBounds: vi.fn().mockImplementation(() => ({ isValid: () => true })),
        }
    };
});

describe('InteractiveMap', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockDestinations = [
        { id: 1, name: 'Place 1', latitude: 4.8, longitude: -75.6, category: { slug: 'naturaleza' } },
        { id: 2, name: 'Place 2', latitude: 4.9, longitude: -75.5, category: { slug: 'cascadas' } },
    ];

    it('renders the map container and legend', () => {
        render(<InteractiveMap destinations={mockDestinations} />);
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        expect(screen.getByText('home.map.legend')).toBeInTheDocument();
    });

    it('renders the correct number of markers', () => {
        render(<InteractiveMap destinations={mockDestinations} />);
        const markers = screen.getAllByTestId('marker');
        expect(markers).toHaveLength(2);
    });

    it('calls onMarkerClick when a marker is clicked', () => {
        const onMarkerClickMock = vi.fn();
        render(<InteractiveMap destinations={mockDestinations} onMarkerClick={onMarkerClickMock} />);
        
        const markers = screen.getAllByTestId('marker');
        fireEvent.click(markers[0]);

        expect(onMarkerClickMock).toHaveBeenCalledWith(1);
    });
});
