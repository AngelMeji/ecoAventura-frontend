import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminPartnerRequests from './AdminPartnerRequests';
import { partnerService } from '../../services/partnerService';

vi.mock('../../services/partnerService', () => ({
    partnerService: {
        getAllRequests: vi.fn(),
        approveRequest: vi.fn(),
        rejectRequest: vi.fn(),
    },
}));

const mockRequests = [
    {
        id: 1,
        status: 'pending',
        place_name: 'Cascada El Oro',
        place_address: 'Calle 5 #3-2, Pereira',
        user: { id: 1, name: 'Carlos Socio', email: 'carlos@example.com' },
    },
    {
        id: 2,
        status: 'approved',
        place_name: 'Mirador Verde',
        place_address: 'Km 2 vía Marsella',
        user: { id: 2, name: 'Laura García', email: 'laura@example.com' },
    },
];

describe('AdminPartnerRequests Component', () => {
    const onNotify = vi.fn();
    const onConfirm = vi.fn();
    const onCloseModal = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially and then shows partner requests', async () => {
        vi.mocked(partnerService.getAllRequests).mockResolvedValueOnce({ data: mockRequests, current_page: 1, last_page: 1, total: 2 } as any);

        render(<AdminPartnerRequests onNotify={onNotify} onConfirm={onConfirm} onCloseModal={onCloseModal} />);

        expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Cascada El Oro')).toBeInTheDocument();
            expect(screen.getByText('Mirador Verde')).toBeInTheDocument();
        });
    });

    it('shows "No hay solicitudes pendientes." when empty', async () => {
        vi.mocked(partnerService.getAllRequests).mockResolvedValueOnce([] as any);

        render(<AdminPartnerRequests onNotify={onNotify} onConfirm={onConfirm} onCloseModal={onCloseModal} />);

        await waitFor(() => {
            expect(screen.getByText('No hay solicitudes pendientes.')).toBeInTheDocument();
        });
    });

    it('shows APROBAR and RECHAZAR buttons only for pending requests', async () => {
        vi.mocked(partnerService.getAllRequests).mockResolvedValueOnce({ data: mockRequests, current_page: 1, last_page: 1, total: 2 } as any);

        render(<AdminPartnerRequests onNotify={onNotify} onConfirm={onConfirm} onCloseModal={onCloseModal} />);

        await waitFor(() => screen.getByText('Cascada El Oro'));

        // Only Carlos (pending) should have APROBAR/RECHAZAR. Laura (approved) should not.
        expect(screen.getByRole('button', { name: 'APROBAR' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'RECHAZAR' })).toBeInTheDocument();
        // Only one APROBAR button (for the pending request)
        expect(screen.getAllByRole('button', { name: 'APROBAR' }).length).toBe(1);
    });

    it('calls onConfirm with correct data when APROBAR is clicked', async () => {
        vi.mocked(partnerService.getAllRequests).mockResolvedValueOnce({ data: mockRequests, current_page: 1, last_page: 1, total: 2 } as any);

        render(<AdminPartnerRequests onNotify={onNotify} onConfirm={onConfirm} onCloseModal={onCloseModal} />);

        await waitFor(() => screen.getByText('APROBAR'));

        fireEvent.click(screen.getByRole('button', { name: 'APROBAR' }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Aprobar Solicitud',
                type: 'success',
            })
        );
    });

    it('calls onConfirm with correct data when RECHAZAR is clicked', async () => {
        vi.mocked(partnerService.getAllRequests).mockResolvedValueOnce({ data: mockRequests, current_page: 1, last_page: 1, total: 2 } as any);

        render(<AdminPartnerRequests onNotify={onNotify} onConfirm={onConfirm} onCloseModal={onCloseModal} />);

        await waitFor(() => screen.getByText('RECHAZAR'));

        fireEvent.click(screen.getByRole('button', { name: 'RECHAZAR' }));

        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Rechazar Solicitud',
                type: 'danger',
            })
        );
    });

    it('shows error notification when API call fails', async () => {
        vi.mocked(partnerService.getAllRequests).mockRejectedValueOnce(new Error('Network error'));

        render(<AdminPartnerRequests onNotify={onNotify} onConfirm={onConfirm} onCloseModal={onCloseModal} />);

        await waitFor(() => {
            expect(onNotify).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'error',
                    message: 'Error cargando solicitudes de socios.',
                })
            );
        });
    });
});
