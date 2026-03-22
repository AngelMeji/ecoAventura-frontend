import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConfirmationModal from './ConfirmationModal';

describe('ConfirmationModal Component', () => {
    const defaultProps = {
        isOpen: true,
        title: '¿Eliminar usuario?',
        message: 'Esta acción no se puede deshacer.',
        onConfirm: vi.fn(),
        onCancel: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when isOpen is false', () => {
        const { container } = render(<ConfirmationModal {...defaultProps} isOpen={false} />);
        expect(container).toBeEmptyDOMElement();
    });

    it('renders title and message when open', () => {
        render(<ConfirmationModal {...defaultProps} />);
        expect(screen.getByText('¿Eliminar usuario?')).toBeInTheDocument();
        expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();
    });

    it('renders default button texts (Confirmar and Cancelar)', () => {
        render(<ConfirmationModal {...defaultProps} />);
        expect(screen.getByRole('button', { name: /Confirmar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
    });

    it('renders custom button texts when provided', () => {
        render(
            <ConfirmationModal
                {...defaultProps}
                confirmText="Sí, eliminar"
                cancelText="No, volver"
            />
        );
        expect(screen.getByRole('button', { name: /Sí, eliminar/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /No, volver/i })).toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', () => {
        render(<ConfirmationModal {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /Confirmar/i }));
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<ConfirmationModal {...defaultProps} />);
        fireEvent.click(screen.getByRole('button', { name: /Cancelar/i }));
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
    });

    it('sets body overflow to hidden when modal opens', () => {
        render(<ConfirmationModal {...defaultProps} />);
        expect(document.body.style.overflow).toBe('hidden');
    });
});
