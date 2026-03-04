import React, { useState, useEffect, useCallback } from 'react';
import InteractiveMap from '../../components/map/InteractiveMap';
import DestinationCard from '../../components/destination/DestinationCard';
import FilterBar from '../../components/home/FilterBar';
import Header from '../../components/layout/Header';
import CategorySection from '../../components/home/CategorySection';
import { DestinationController } from '../../controllers/Destination.controller';
import type { Place, PaginatedResponse } from '../../models/Place.model';
import DestinationModal from '../../components/destination/DestinationModal';

/**
 * Vista principal - Home
 * Muestra el mapa interactivo y los destinos ecoturísticos cargados del backend
 */
const Home: React.FC = () => {
    const [destinations, setDestinations] = useState<Place[]>([]);
    const [allDestinations, setAllDestinations] = useState<Place[]>([]);
    const [mapDestinations, setMapDestinations] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState<any>(null);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [highlightedDestination] = useState<number | null>(null);

    const ITEMS_PER_PAGE = 12;

    // Actualizar destinos visibles cuando cambia la página o la lista total
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDestinations(allDestinations.slice(startIndex, endIndex));

        setPaginationMeta({
            current_page: currentPage,
            last_page: Math.ceil(allDestinations.length / ITEMS_PER_PAGE),
            total: allDestinations.length,
            per_page: ITEMS_PER_PAGE
        });
    }, [currentPage, allDestinations]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState<Place | null>(null);

    // Estados para las secciones

    // Cargar datos al inicio
    useEffect(() => {
        loadData();
    }, []);

    // Cargar datos cuando cambian los filtros
    useEffect(() => {
        fetchDestinations();
    }, [activeCategory, searchQuery]);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchDestinations(),
                DestinationController.getCategoryStats().then(setCategoryStats)
            ]);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDestinations = async () => {
        try {
            let result: PaginatedResponse<Place>;
            // Fetch a large number of items for client-side pagination/filtering
            // This is temporary until server-side pagination is fully integrated with the UI
            const PER_PAGE_LIMIT = 1000;

            if (searchQuery) {
                result = await DestinationController.searchDestinations(searchQuery, 1, PER_PAGE_LIMIT);
            } else {
                result = await DestinationController.getDestinationsByCategory(activeCategory, 1, PER_PAGE_LIMIT);
            }

            // The controller returns a PaginatedResponse, we need .data
            // If the controller was hacked to return array, we check that too
            const items = result.data || (Array.isArray(result) ? result : []);

            setAllDestinations(items); // Store all for client-side pagination

            // Also update map destinations directly with all items
            setMapDestinations(items);

        } catch (error) {
            console.error('Error buscando destinos:', error);
            setAllDestinations([]);
            setMapDestinations([]);
        }
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setActiveCategory('Todos');
    };

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        setSearchQuery('');
        // Scroll to grid
        const gridElement = document.getElementById('destinations-grid');
        if (gridElement) {
            gridElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        // Scroll to grid top
        const gridElement = document.getElementById('destinations-grid');
        if (gridElement) {
            gridElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleMarkerClick = useCallback(async (destinationId: number) => {
        try {
            const destination = await DestinationController.getDestinationById(destinationId);
            if (destination) {
                setSelectedDestination(destination);
                setIsModalOpen(true);
            } else {
                console.warn('⚠️ Destination is null or undefined');
            }
        } catch (error) {
            console.error('❌ Error al abrir modal desde el mapa:', error);
        }
    }, []);

    const handleCardClick = async (destinationId: number) => {
        try {
            const destination = await DestinationController.getDestinationById(destinationId);
            if (destination) {
                setSelectedDestination(destination);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('Error al abrir detalle:', error);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDestination(null);
    };

    if (loading && destinations.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-eco-bg flex-col gap-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-eco-primary-600"></div>
                <p className="text-xl font-display text-eco-primary-800 animate-pulse">Cargando la magia de Risaralda...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-eco-bg text-eco-text selection:bg-eco-primary-100 selection:text-eco-primary-900">
            <Header />

            <main className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Hero Section */}
                <div className="mb-12 text-center py-12 px-4 bg-gradient-to-b from-eco-primary-50/50 to-transparent rounded-3xl animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-eco-primary-900 mb-4 font-display">
                        Explora Destinos Ecoturísticos
                    </h1>
                    <p className="text-lg md:text-xl text-eco-text-light max-w-2xl mx-auto font-medium leading-relaxed">
                        Descubre los lugares más hermosos y sostenibles para tu próxima aventura en Colombia
                    </p>
                </div>

                <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <FilterBar
                        onSearchChange={handleSearchChange}
                        activeCategory={activeCategory}
                    />
                </div>

                {!searchQuery && (
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <CategorySection
                            categories={categoryStats}
                            activeCategory={activeCategory}
                            onCategoryChange={handleCategoryChange}
                        />
                    </div>
                )}

                {/* Destinations Grid - Aparece primero cuando hay búsqueda */}
                <div id="destinations-grid" className="mb-12 animate-fade-in-up" style={{ animationDelay: searchQuery ? '0.2s' : '0.4s' }}>
                    <div className="flex items-center gap-3 mb-8">
                        <h2 className="text-3xl font-bold text-eco-primary-900 font-display flex items-baseline gap-3">
                            {searchQuery ? 'Resultados de Búsqueda' : 'Todos los Destinos'}
                            <span className="text-lg font-normal text-eco-text-light font-sans bg-eco-primary-50 px-3 py-1 rounded-full">
                                {destinations.length} {destinations.length === 1 ? 'destino' : 'destinos'}
                            </span>
                        </h2>
                    </div>

                    {destinations.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-eco-text-light text-xl">No se encontraron destinos que coincidan con tu búsqueda.</p>
                        </div>
                    ) : (<>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {destinations.map((destination) => (
                                <div
                                    key={destination.id}
                                    id={`destination-${destination.id}`}
                                >
                                    <DestinationCard
                                        destination={destination as any}
                                        isHighlighted={highlightedDestination === destination.id}
                                        onClick={() => handleCardClick(destination.id)}
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {paginationMeta && paginationMeta.last_page > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    aria-label="Página anterior"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                <div className="flex items-center gap-1">
                                    {Array.from({ length: paginationMeta.last_page }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-10 h-10 rounded-xl font-bold transition-all shadow-sm ${currentPage === page
                                                ? 'bg-eco-primary-600 text-white'
                                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === paginationMeta.last_page}
                                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                    aria-label="Página siguiente"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </>)}
                </div>

                {/* Map Section - Aparece después del grid cuando hay búsqueda */}
                <div className="mb-12 animate-fade-in-up" style={{ animationDelay: searchQuery ? '0.3s' : '0.3s' }}>
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-3xl font-bold text-eco-primary-900 font-display">
                            Mapa de Destinos (V2)
                        </h2>
                    </div>
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-eco-primary-100">
                        <InteractiveMap
                            destinations={mapDestinations as any[]}
                            onMarkerClick={handleMarkerClick}
                            highlightedDestination={highlightedDestination}
                            shouldAutoFit={false}
                        />
                    </div>
                </div>
            </main>

            {selectedDestination && (
                <DestinationModal
                    destination={selectedDestination}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}

            <footer className="bg-white border-t border-eco-primary-100 mt-12 bg-gradient-to-t from-eco-primary-50/30">
                <div className="container mx-auto px-4 py-8 text-center text-eco-text-light text-sm font-medium">
                    <p>© 2025 EcoTurismo Risaralda. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
