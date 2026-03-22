import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AccessibilityMenu from './AccessibilityMenu';

// Mock LanguageContext
vi.mock('../../context/LanguageContext', () => ({
    useLanguage: () => ({
        language: 'es',
        setLanguage: vi.fn(),
        t: (key: string) => key
    })
}));

describe('AccessibilityMenu', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        // Reset document level styles
        document.documentElement.style.fontSize = '';
        document.documentElement.className = '';
    });

    it('renders the accessibility toggle button initially', () => {
        render(<AccessibilityMenu />);
        expect(screen.getByTitle('accessibility.title')).toBeInTheDocument();
        // The menu panel should be hidden initially
        expect(screen.queryByText('accessibility.reset')).not.toBeInTheDocument();
    });

    it('opens the menu panel when clicking the toggle', () => {
        render(<AccessibilityMenu />);
        const toggleButton = screen.getByTitle('accessibility.title');
        fireEvent.click(toggleButton);

        expect(screen.getByText('accessibility.reset')).toBeInTheDocument();
        expect(screen.getByText('accessibility.invertColors')).toBeInTheDocument();
    });

    it('changes font size and updates documentElement and localStorage', () => {
        render(<AccessibilityMenu />);
        // Open menu
        fireEvent.click(screen.getByTitle('accessibility.title'));

        const increaseBtn = screen.getByLabelText('Increase font size');
        fireEvent.click(increaseBtn);

        expect(document.documentElement.style.fontSize).toBe('110%');
        expect(localStorage.getItem('accessibility_fontSize')).toBe('110');
    });

    it('toggles invert colors class', () => {
        render(<AccessibilityMenu />);
        fireEvent.click(screen.getByTitle('accessibility.title'));

        const invertBtn = screen.getByText('accessibility.invertColors').closest('button');
        if (invertBtn) fireEvent.click(invertBtn);

        expect(document.documentElement.classList.contains('invert-colors')).toBe(true);
        expect(localStorage.getItem('accessibility_invertColors')).toBe('true');
    });
});
