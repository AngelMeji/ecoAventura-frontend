import { placesService } from '../services/placesService';
import type { Place } from '../models/Place.model';

/**
 * DestinationController (Refactorizado)
 * Adaptador entre la Vista y el Servicio de Lugares (Backend)
 */
export class DestinationController {

    /**
     * Obtiene todos los destinos desde el backend
     */
    static async getAllDestinations(): Promise<Place[]> {
        const response = await placesService.getAll();
        return response.data;
    }

    /**
     * Obtiene destinos filtrados por categoría
     */
    static async getDestinationsByCategory(categorySlug: string): Promise<Place[]> {
        if (categorySlug === 'Todos' || categorySlug === '') {
            return this.getAllDestinations();
        }
        const response = await placesService.getAll({ category: categorySlug });
        return response.data;
    }

    /**
     * Busca destinos por texto
     */
    static async searchDestinations(query: string): Promise<Place[]> {
        const response = await placesService.getAll({ search: query });
        return response.data;
    }

    /**
     * Obtiene un destino por ID
     */
    static async getDestinationById(id: number): Promise<Place> {
        return await placesService.getOne(id);
    }

    /**
     * Obtiene estadísticas de categorías
     */
    static async getCategoryStats(): Promise<{ name: string; slug: string; count: number; avgRating: number; icon: string }[]> {
        try {
            const categories = await placesService.getCategories();

            // Icon mapping helper
            const getIcon = (slug: string) => {
                const icons: Record<string, string> = {
                    'naturaleza': '',
                    'aventura': '',
                    'cascadas': '',
                    'termal': '',
                    'fauna': '',
                    'senderismo': ''
                };
                return icons[slug] || ''; // Default icon
            };

            return categories.map((cat: any) => ({
                name: cat.name,
                slug: cat.slug || cat.name.toLowerCase().replace(/ /g, '-'),
                count: cat.count || cat.places_count || 0, // Fix: Backend sends 'count'
                avgRating: cat.avgRating || cat.avg_rating || 0, // Fix: Backend sends 'avgRating'
                icon: cat.icon || getIcon(cat.slug || cat.name.toLowerCase()) // Fix: Backend sends icon too
            }));
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    }

    static async getFeaturedDestinations(): Promise<Place[]> {
        // Usar filtro del backend
        const response = await placesService.getAll({ featured: 1 });
        return response.data;
    }

    static async getPopularDestinations(): Promise<Place[]> {
        // Idealmente endpoint de backend, por ahora obtenemos todos y ordenamos
        // O si el backend soportara ?sort=rating
        const response = await placesService.getAll();
        return response.data.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0)).slice(0, 4);
    }
}
