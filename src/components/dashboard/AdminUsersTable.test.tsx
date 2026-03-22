import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminUsersTable from './AdminUsersTable';
import { placesService } from '../../services/placesService';

// Mock placesService
vi.mock('../../services/placesService', () => ({
    placesService: {
        getAllUsers: vi.fn(),
        deleteUser: vi.fn(),
        updateUser: vi.fn(),
        createUser: vi.fn(),
    },
}));

const mockUsers = [
    { id: 1, name: 'Ana García', email: 'ana@example.com', role: 'user', avatar: null },
    { id: 2, name: 'Pedro Admin', email: 'pedro@example.com', role: 'admin', avatar: null },
    { id: 3, name: 'María Socio', email: 'maria@example.com', role: 'partner', avatar: null },
];

describe('AdminUsersTable Component', () => {
    const onNotify = vi.fn();
    const onConfirm = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders user rows from initialUsers prop', async () => {
        render(
            <AdminUsersTable
                onNotify={onNotify}
                onConfirm={onConfirm}
                initialUsers={mockUsers}
            />
        );

        await waitFor(() => {
            expect(screen.getAllByText('Ana García').length).toBeGreaterThan(0);
            expect(screen.getAllByText('Pedro Admin').length).toBeGreaterThan(0);
            expect(screen.getAllByText('María Socio').length).toBeGreaterThan(0);
        });
    });

    it('shows a loading state and calls getAllUsers when no initialUsers is provided', async () => {
        vi.mocked(placesService.getAllUsers).mockResolvedValueOnce({ data: mockUsers, current_page: 1, last_page: 1, total: 3 } as any);

        render(<AdminUsersTable onNotify={onNotify} onConfirm={onConfirm} />);

        expect(screen.getByText('Cargando usuarios...')).toBeInTheDocument();

        await waitFor(() => {
            expect(placesService.getAllUsers).toHaveBeenCalledWith(1);
        });
    });

    it('does NOT show delete button for admin users', async () => {
        render(
            <AdminUsersTable
                onNotify={onNotify}
                onConfirm={onConfirm}
                initialUsers={mockUsers}
            />
        );

        await waitFor(() => screen.getAllByText('Ana García'));

        // Count delete buttons (only non-admin users should have one in desktop view)
        const deleteTitles = document.querySelectorAll('[title="Eliminar"]');
        // Only Ana (user) and María (partner) should have delete - Pedro (admin) should not
        expect(deleteTitles.length).toBe(2);
    });

    it('calls onConfirm when delete button is clicked on a regular user', async () => {
        render(
            <AdminUsersTable
                onNotify={onNotify}
                onConfirm={onConfirm}
                initialUsers={mockUsers}
            />
        );

        await waitFor(() => screen.getAllByText('Ana García'));

        // Click the first delete button (Ana García)
        const deleteButton = document.querySelectorAll('[title="Eliminar"]')[0];
        fireEvent.click(deleteButton);

        expect(onConfirm).toHaveBeenCalledTimes(1);
        expect(onConfirm).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Eliminar Usuario',
                type: 'danger',
            })
        );
    });

    it('opens the "Crear Nuevo Usuario" modal on button click', async () => {
        render(
            <AdminUsersTable
                onNotify={onNotify}
                onConfirm={onConfirm}
                initialUsers={mockUsers}
            />
        );

        await waitFor(() => screen.getByText('Crear Nuevo Usuario'));

        const createButton = screen.getByText('Crear Nuevo Usuario');
        fireEvent.click(createButton);

        expect(screen.getByText('Crear Nuevo Usuario', { selector: 'h3' })).toBeInTheDocument();
    });

    it('shows validation error when passwords do not match in create form', async () => {
        render(
            <AdminUsersTable
                onNotify={onNotify}
                onConfirm={onConfirm}
                initialUsers={mockUsers}
            />
        );

        await waitFor(() => screen.getByText('Crear Nuevo Usuario'));
        fireEvent.click(screen.getByText('Crear Nuevo Usuario'));

        // Fill in form with mismatched passwords
        const inputs = screen.getAllByPlaceholderText(/Mínimo 6 caracteres|Confirma la contraseña/);
        fireEvent.change(inputs[0], { target: { value: 'password123' } });
        fireEvent.change(inputs[1], { target: { value: 'different_pass' } });

        const form = document.querySelector('form:last-of-type')!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
        });
    });
});
