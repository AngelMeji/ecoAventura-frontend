import React, { useState, useEffect } from 'react';
import InteractiveMap from '../../components/map/InteractiveMap';
import DestinationCard from '../../components/destination/DestinationCard';
import FilterBar from '../../components/home/FilterBar';
import Header from '../../components/layout/Header';
import CategorySection from '../../components/home/CategorySection';
import FeaturedSection from '../../components/home/FeaturedSection';
import { DestinationController } from '../../controllers/Destination.controller';
import type { Place } from '../../models/Place.model'; // Usamos el nuevo modelo Place
import DestinationModal from '../../components/destination/DestinationModal';

/**
 * Vista principal - Home
 * Muestra el mapa interactivo y los destinos ecoturísticos cargados del backend
 */
const Home: React.FC = () => {
    const [destinations, setDestinations] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [highlightedDestination, setHighlightedDestination] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState<Place | null>(null);

    // Estados para las secciones (stats y destacados)
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const [featuredDestinations, setFeaturedDestinations] = useState<Place[]>([]);
    const [popularDestinations, setPopularDestinations] = useState<Place[]>([]);

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
                DestinationController.getCategoryStats().then(setCategoryStats),
                DestinationController.getFeaturedDestinations().then(setFeaturedDestinations),
                DestinationController.getPopularDestinations().then(setPopularDestinations)
            ]);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDestinations = async () => {
        try {
            let result: Place[];
            if (searchQuery) {
                result = await DestinationController.searchDestinations(searchQuery);
            } else {
                result = await DestinationController.getDestinationsByCategory(activeCategory);
            }
            setDestinations(result);
        } catch (error) {
            console.error('Error buscando destinos:', error);
            // Fallback vacio o manejar error
            setDestinations([]);
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

    const handleMarkerClick = (destinationId: number) => {
        setHighlightedDestination(destinationId);

        // Scroll to the corresponding card
        const cardElement = document.getElementById(`destination-${destinationId}`);
        if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        setTimeout(() => {
            setHighlightedDestination(null);
        }, 3000);
    };

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

                {/* Sólo mostramos destacado si estamos en la vista por defecto */}
                {!searchQuery && activeCategory === 'Todos' && featuredDestinations.length > 0 && (
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <FeaturedSection
                            featuredDestinations={featuredDestinations} // Corrección: pasar array de Place, FeaturedSection debe ser compatible
                            popularDestinations={popularDestinations}
                            onDestinationClick={handleCardClick}
                        />
                    </div>
                )}

                {/* Map Section - Necesita ser compatible con Place */}
                <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-3xl font-bold text-eco-primary-900 font-display">
                            Mapa de Destinos
                        </h2>
                    </div>
                    {/* Nota: InteractiveMap necesita ser actualizado para aceptar Place[] si no lo es ya */}
                    <div className="rounded-2xl overflow-hidden shadow-lg border border-eco-primary-100">
                        <InteractiveMap
                            destinations={destinations as any[]}
                            onMarkerClick={handleMarkerClick}
                            highlightedDestination={highlightedDestination}
                        />
                    </div>
                </div>

                {/* Destinations Grid */}
                <div id="destinations-grid" className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center gap-3 mb-8">
                        <h2 className="text-3xl font-bold text-eco-primary-900 font-display flex items-baseline gap-3">
                            Todos los Destinos
                            <span className="text-lg font-normal text-eco-text-light font-sans bg-eco-primary-50 px-3 py-1 rounded-full">
                                {destinations.length} {destinations.length === 1 ? 'destino' : 'destinos'}
                            </span>
                        </h2>
                    </div>

                    {destinations.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <p className="text-eco-text-light text-xl">No se encontraron destinos que coincidan con tu búsqueda.</p>
                        </div>
                    ) : (
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
                    )}
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
