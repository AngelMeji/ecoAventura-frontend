import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Alert from './Alert';

describe('Alert Component', () => {
    it('renders with success type correctly', () => {
        render(<Alert type="success" message="Operation successful!" />);
        const messageElement = screen.getByText('Operation successful!');
        expect(messageElement).toBeInTheDocument();
        // Check for success container classes
        const container = messageElement.closest('div.bg-green-50');
        expect(container).toBeInTheDocument();
    });

    it('renders children correctly', () => {
        render(
            <Alert type="error">
                <span data-testid="child-element">Error happened</span>
            </Alert>
        );
        expect(screen.getByTestId('child-element')).toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
        const handleClose = vi.fn();
        render(<Alert type="info" message="Info alert" onClose={handleClose} />);
        
        const closeButton = screen.getByRole('button');
        fireEvent.click(closeButton);
        
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
