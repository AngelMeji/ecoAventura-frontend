import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Logo from './Logo';

describe('Logo Component', () => {
    it('renders the brand name EcoAventura', () => {
        render(<Logo />);
        expect(screen.getByText('EcoAventura')).toBeInTheDocument();
    });

    it('applies a custom className when provided', () => {
        const { container } = render(<Logo className="custom-class" />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper).toHaveClass('custom-class');
    });
});
