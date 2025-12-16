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
                    // Tree/Leaf for Nature
                    'naturaleza': '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>',
                    // Mountain for Adventure
                    'aventura': '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
                    // Water drop/Waves for Waterfalls
                    'cascadas': '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>',
                    // Thermometer/Hot for Thermal
                    'termal': '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>',
                    // Paw for Fauna
                    'fauna': '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
                    // Footsteps/Map for Hiking
                    'senderismo': '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
                };
                return icons[slug] || '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>';
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
