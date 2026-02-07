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
        // Categorías Principales de Ecoturismo en Risaralda
        const defaultCategories = [
            { name: 'Avistamiento de Aves', slug: 'avistamiento-de-aves' },
            { name: 'Senderismo', slug: 'senderismo' },
            { name: 'Paisaje Cultural Cafetero', slug: 'paisaje-cultural-cafetero' },
            { name: 'Termales', slug: 'termales' },
            { name: 'Nevados y Alta Montaña', slug: 'nevados' },
            { name: 'Cascadas', slug: 'cascadas' },
            { name: 'Glamping', slug: 'glamping' },
            { name: 'Parques Temáticos', slug: 'parques-tematicos' },
            { name: 'Ríos y Lagos', slug: 'rios-y-lagos' },
            { name: 'Miradores', slug: 'miradores' },
            { name: 'Turismo Rural', slug: 'turismo-rural' },
            { name: 'Aventura', slug: 'aventura' }
        ];

        // Helper para mapear iconos
        const getIcon = (rawSlug: string) => {
            const slug = rawSlug.toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/ /g, '-');

            const icons: Record<string, string> = {
                // Avistamiento de Aves - Pájaro / Binoculares (User requested: Bird flying/perched or binoculars)
                // Avistamiento de Aves - Pájaro (Perched Bird - User Request)
                'avistamiento-de-aves': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 18h16M5.8 9.6c.9-1.2 2.5-1.6 3.9-1.1 1.3.5 2.3 1.6 2.7 2.9l.4 1.3-1.4.3c-.8.2-1.6-.2-1.9-1-.3-.8-.1-1.6.5-2.2l-1.3-1c-.5.4-.8 1-.9 1.6-.1.6.1 1.2.5 1.6l1.5 1.5c1.1 1.1 2.6 1.7 4.1 1.7 1.5 0 3-.6 4.1-1.7l1-1M6.5 9.5c.3-.3.7-.4 1.1-.4.4 0 .7.1 1 .4l2.5 2.5" /></svg>',
                // Using a simpler, cleaner perched bird path for better clarity
                'aviturismo': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15c0-2.2 4-4 4-4h.5c1.5 0 3-1.5 4-2.5 1-1 2.5-1.5 4-1.5 1.5 0 3 1 3 3 0 1.5-1 3-3 4-2 1-4 2-8 3-2 0-3.5-1-3.5-2z M 5 18 L 5 21 M 9 18 L 9 21 M 2 18 h 10" /></svg>',
                'aves': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 15c0-2.2 4-4 4-4h.5c1.5 0 3-1.5 4-2.5 1-1 2.5-1.5 4-1.5 1.5 0 3 1 3 3 0 1.5-1 3-3 4-2 1-4 2-8 3-2 0-3.5-1-3.5-2z M 5 18 L 5 21 M 9 18 L 9 21 M 2 18 h 10" /></svg>',

                // Senderismo - Caminante con Mochila y Bastón (Hiker Silhouette)
                'senderismo': '<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M18 21h-1.5V5h1.5v16zm-5-1l-2.5-6-2.5 6h-1.8l3-7.5-3.5-5.5 1.2-1 4.5 1.5 2 4 1.5 5.5h-1.9zM7 13c-1.7 0-3-1.3-3-3s1.3-3 3-3 3 1.3 3 3-1.3 3-3 3zM12.5 5.5c.8 0 1.5-.7 1.5-1.5S13.3 2.5 12.5 2.5 11 3.2 11 4s.7 1.5 1.5 1.5z"/></svg>',

                // Paisaje Cultural Cafetero - Taza de Café / Grano (User requested: Coffee bean or cup)
                'paisaje-cultural-cafetero': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" /></svg>', // Smoking Coffee Cup

                // Termales - Ondas de agua con vapor (User requested: Waves with steam)
                'termales': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 14a6 6 0 0012 0M6 14v2m12-2v2M12 3v5m4-5v5m-8-5v5M4 14.8C2.8 16 2.8 18 4 19.2s3.2 1.2 4.4 0c1.2-1.2 1.2-3.2 0-4.4M15.6 14.8c-1.2 1.2-1.2 3.2 0 4.4s3.2 1.2 4.4 0c1.2-1.2 1.2-3.2 0-4.4" /></svg>', // Steam and waves
                'termal': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v5m4-5v5m-8-5v5M4 14.8c0 2.2 3.6 4.2 8 4.2s8-2 8-4.2" /></svg>',

                // Nevados - Montaña con nieve (User requested: Mountain with snow cap)
                'nevados': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 19.4L14 4l-4.5 9.9M7 19.4L3 14 12 4M21 19.4H3M12 4l2.5 5.5-5 5" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4l3 7h-6l3-7z" /></svg>', // Mountain peak

                // Cascadas - Caída de agua con ondas (S-Curve Waterfall from image)
                'cascadas': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 3c0 4-2 6-4 9v6M13 3c0 4-2 6-4 9v6M9 3c0 4-2 6-4 9v6M3 21c2 0 3-1 6-1s4 1 6 1 4-1 6-1" /></svg>', // Three streams curving down into waves

                // Glamping - Carpa Tipi (User requested: Tipi/Dome tent)
                'glamping': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 21H4L12 3l8 18zM12 7v14M9 21l3-5 3 5" /></svg>', // Tipi Tent

                // Parques Temáticos - Ticket (User requested: Ticket)
                'parques-tematicos': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>',

                // Ríos y Lagos - Tres ondas de agua (Three Waves - User requested)
                'rios-y-lagos': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6c2.5-2 5.5-2 8 0s5.5 2 8 0 M3 12c2.5-2 5.5-2 8 0s5.5 2 8 0 M3 18c2.5-2 5.5-2 8 0s5.5 2 8 0" /></svg>',
                'rios': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6c2.5-2 5.5-2 8 0s5.5 2 8 0 M3 12c2.5-2 5.5-2 8 0s5.5 2 8 0 M3 18c2.5-2 5.5-2 8 0s5.5 2 8 0" /></svg>',

                // Miradores - Ojo (User requested: Eye or person looking)
                'miradores': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>',

                // Turismo Rural - Casa de campo (User requested: Farm/House)
                'turismo-rural': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',

                // Aventura - Brújula (User requested: Compass)
                'aventura': '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="1.5" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.83 9.17l-5.66 5.66-2.5-2.5 5.66-5.66 2.5 2.5z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 2v2m0 16v2m10-10h-2M4 12H2" /></svg>' // Compass
            };

            // Icono genérico
            return icons[slug] || '<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>';
        };

        try {
            const backendCategories = await placesService.getCategories();
            const categoryMap = new Map();

            // 1. Inicializar predeterminadas (Risaralda)
            defaultCategories.forEach(cat => {
                categoryMap.set(cat.slug, { ...cat, count: 0, avgRating: 0 });
            });

            // 2. Combinar con datos del backend
            backendCategories.forEach((cat: any) => {
                const slug = cat.slug || cat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-');
                if (categoryMap.has(slug)) {
                    const existing = categoryMap.get(slug);
                    categoryMap.set(slug, {
                        ...existing,
                        count: cat.count || cat.places_count || 0,
                        avgRating: cat.avgRating || cat.avg_rating || 0
                    });
                }
            });

            return Array.from(categoryMap.values()).map((cat: any) => ({
                ...cat,
                icon: cat.icon || getIcon(cat.slug)
            }));

        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback
            return defaultCategories.map(cat => ({
                ...cat,
                count: 0,
                avgRating: 0,
                icon: getIcon(cat.slug)
            }));
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
