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
                    'naturaleza': '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" /></svg>', // Placeholder lightning -> Tree
                    'aventura': '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>',
                    'cascadas': '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>', // Heart -> Waterfall-like?
                    'termal': '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clip-rule="evenodd" /></svg>',
                    'fauna': '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm14-1a1 1 0 10-2 0 1 1 0 002 0z" clip-rule="evenodd" /></svg>',
                    'senderismo': '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v3.25a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" /></svg>'
                };
                return icons[slug] || '<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>';
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
