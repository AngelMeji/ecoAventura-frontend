import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DestinationCard from './DestinationCard';

// Mock LanguageContext and translations to just return keys/values
vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({ t: (key: string) => key, language: 'es' })
}));
vi.mock('../../translations/places', () => ({
    getTranslatedPlace: (place: any) => place
}));
vi.mock('../../utils/imageUtils', () => ({
    getOptimizedImageUrl: (url: string) => url
}));

const mockDestination = {
    id: 1,
    name: 'El Valle de Cocora',
    short_description: 'Un lugar increíble',
    duration: 'Full day',
    difficulty: 'Fácil',
    category: { name: 'Naturaleza', slug: 'naturaleza' },
    images: [{ full_url: 'http://example.com/img.jpg' }]
};

describe('DestinationCard', () => {
    it('renders correctly with given destination data', () => {
        render(<DestinationCard destination={mockDestination} />);

        expect(screen.getByText('El Valle de Cocora')).toBeInTheDocument();
        expect(screen.getByText('Un lugar increíble')).toBeInTheDocument();
        expect(screen.getByText('Full day')).toBeInTheDocument();
    });

    it('calls onClick when clicking the card', () => {
        const onClickMock = vi.fn();
        render(<DestinationCard destination={mockDestination} onClick={onClickMock} />);

        // Click on the card container
        const cardTitle = screen.getByText('El Valle de Cocora');
        fireEvent.click(cardTitle.closest('div.group')!);
        
        expect(onClickMock).toHaveBeenCalled();
    });

    it('falls back to window.location if onClick is not provided', () => {
        // Save and mock window.location
        const originalLocation = window.location;
        // @ts-ignore
        delete window.location;
        window.location = { href: '' } as any;

        render(<DestinationCard destination={mockDestination} />);
        
        // Find the "Ver detalles" button
        const viewButton = screen.getByText('home.card.viewDetails').closest('button');
        if (viewButton) fireEvent.click(viewButton);

        expect(window.location.href).toBe('/place/1');

        // Restore window.location
        window.location = originalLocation;
    });
});
