import api from './authService';
import type { Place, PaginatedResponse, Category } from '../models/Place.model';

// Definición de parámetros para filtrar lugares públicos
export interface PlaceFilters {
    page?: number;
    category?: string; // slug de categoría
    search?: string;
    featured?: number; // 1 o 0
    user_id?: number | string;
}

export const placesService = {
    // -------------------------------------------------------------------------
    // 1. PUBLIC ENDPOINTS (No Token)
    // -------------------------------------------------------------------------

    // Listado Público (Home/Búsqueda) - Solo APROBADOS
    async getAll(filters: PlaceFilters = {}): Promise<PaginatedResponse<Place>> {
        const params = new URLSearchParams();
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.category) params.append('category', filters.category);
        if (filters.search) params.append('search', filters.search);
        // featured y user_id pueden no estar soportados en el endpoint público básico, 
        // pero se envían por si acaso el backend los filtra.

        const response = await api.get<PaginatedResponse<Place>>(`/places?${params.toString()}`);
        return response.data;
    },

    // Detalle de Lugar Público
    async getOne(idOrSlug: string | number): Promise<Place> {
        const response = await api.get<Place>(`/places/${idOrSlug}`);
        return response.data;
    },

    // Categorías Públicas
    async getCategories(): Promise<Category[]> {
        try {
            const response = await api.get('/categories');
            const data = response.data;
            // Manejo de diferentes estructuras de respuesta
            if (Array.isArray(data)) return data;
            if (data?.data && Array.isArray(data.data)) return data.data;
            return [];
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },

    // -------------------------------------------------------------------------
    // 2. PARTNER ENDPOINTS (Token + Rol Partner/Admin)
    // -------------------------------------------------------------------------

    // Mis Lugares (Dashboard Socio)
    async getPartnerPlaces(): Promise<Place[]> {
        // Nota: Si el backend devuelve paginación, habrá que ajustar el tipo de retorno.
        // Asumo array directo o { data: [] } basado en endpoints típicos.
        const response = await api.get('/partner/places');
        return Array.isArray(response.data) ? response.data : response.data.data;
    },

    // Crear Lugar
    async create(data: FormData): Promise<Place> {
        const response = await api.post<Place>('/partner/places', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Editar Lugar
    async update(id: number, data: FormData): Promise<Place> {
        // En Laravel/PHP, para subir archivos en PUT, se suele usar POST con _method=PUT
        data.append('_method', 'PUT');
        const response = await api.post<Place>(`/partner/places/${id}`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    // Eliminar Lugar
    async delete(id: number): Promise<void> {
        await api.delete(`/partner/places/${id}`);
    },

    // -------------------------------------------------------------------------
    // 3. ADMIN ENDPOINTS (Token + Rol Admin)
    // -------------------------------------------------------------------------

    // Estadísticas Globales (Dashboard Admin)
    async getAdminStats(): Promise<any> {
        const response = await api.get('/admin/stats');
        return response.data;
    },

    // Todos los Lugares (Cualquier estado)
    async getAdminAllPlaces(): Promise<PaginatedResponse<Place> | Place[]> {
        const response = await api.get('/admin/places');
        return response.data;
    },

    // Lugares Pendientes
    async getPendingPlaces(): Promise<Place[]> {
        const response = await api.get<Place[]>('/admin/places/pending');
        // Ajuste defensivo por si devuelve envuelto en data
        return Array.isArray(response.data) ? response.data : (response.data as any).data;
    },

    // Cambiar Estado (Aprobar/Rechazar/Corregir)
    async changeStatus(id: number, status: 'approved' | 'rejected' | 'needs_fix'): Promise<Place> {
        const response = await api.patch<Place>(`/admin/places/${id}/status`, { status });
        return response.data;
    },

    // Wrappers antiguos para compatibilidad con código existente (refactorizar luego si es necesario)
    async approve(id: number): Promise<Place> {
        return this.changeStatus(id, 'approved');
    },
    async reject(id: number): Promise<Place> {
        return this.changeStatus(id, 'rejected');
    },
    async needsFix(id: number): Promise<Place> {
        return this.changeStatus(id, 'needs_fix');
    },

    // Gestión de Usuarios
    async getAllUsers(): Promise<any[]> {
        const response = await api.get('/admin/users');
        return Array.isArray(response.data) ? response.data : response.data.data; // Defensivo
    },

    async createUser(data: any): Promise<any> {
        const response = await api.post('/admin/users', data);
        return response.data;
    },

    async updateUser(id: number, data: Partial<any>): Promise<any> {
        const response = await api.put(`/admin/users/${id}`, data);
        return response.data;
    },

    async deleteUser(id: number): Promise<void> {
        await api.delete(`/admin/users/${id}`);
    },

    // -------------------------------------------------------------------------
    // 4. SOCIAL INTERACTION (Si existen endpoints)
    // -------------------------------------------------------------------------
    // Nota: El usuario no especificó endpoints de reviews/favorites en la actualización,
    // mantengo los anteriores asumiendo que no cambiaron o no se mencionaron.

    async createReview(placeId: number, review: { rating: number; comment: string }): Promise<any> {
        const response = await api.post(`/places/${placeId}/reviews`, review);
        return response.data;
    },

    async updateReview(reviewId: number, review: { rating: number; comment: string }): Promise<any> {
        const response = await api.put(`/reviews/${reviewId}`, review);
        return response.data;
    },

    async deleteReview(reviewId: number): Promise<void> {
        await api.delete(`/reviews/${reviewId}`);
    },

    // Dashboard User (Si existe endpoint específico, sino usar /favorites)
    async getUserDashboard(): Promise<any> {
        // Fallback a favoritos si /user/dashboard ya no existe en la spec
        return { message: "Dashboard endpoint not specified, check favorites" };
    },

    async getFavorites(page: number = 1): Promise<PaginatedResponse<Place>> {
        const response = await api.get<PaginatedResponse<Place>>(`/favorites?page=${page}`);
        return response.data;
    },

    async addFavorite(placeId: number): Promise<void> {
        await api.post('/favorites', { place_id: placeId });
    },

    async removeFavorite(placeId: number): Promise<void> {
        await api.delete(`/favorites/${placeId}`);
    },
};
