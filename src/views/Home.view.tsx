import React, { useState, useEffect } from 'react';
import InteractiveMap from '../components/map/InteractiveMap';
import DestinationCard from '../components/destination/DestinationCard';
import FilterBar from '../components/home/FilterBar';
import Header from '../components/layout/Header';
import CategorySection from '../components/home/CategorySection';
import FeaturedSection from '../components/home/FeaturedSection';
import { DestinationController } from '../controllers/Destination.controller';
import type { Place } from '../models/Place.model'; // Usamos el nuevo modelo Place
import DestinationModal from '../components/destination/DestinationModal';

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
            <div className="min-h-screen flex items-center justify-center bg-eco-bg">
                <p className="text-xl text-eco-teal-700 animate-pulse">Cargando la magia de Risaralda...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-eco-bg">
            <Header />

            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        Explora Destinos Ecoturísticos
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                        Descubre los lugares más hermosos y sostenibles para tu próxima aventura
                    </p>
                </div>

                <FilterBar
                    onSearchChange={handleSearchChange}
                    activeCategory={activeCategory}
                />

                {!searchQuery && (
                    <CategorySection
                        categories={categoryStats}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                )}

                {/* Sólo mostramos destacado si estamos en la vista por defecto */}
                {!searchQuery && activeCategory === 'Todos' && featuredDestinations.length > 0 && (
                    <FeaturedSection
                        featuredDestinations={featuredDestinations} // Corrección: pasar array de Place, FeaturedSection debe ser compatible
                        popularDestinations={popularDestinations}
                        onDestinationClick={handleCardClick}
                    />
                )}

                {/* Map Section - Necesita ser compatible con Place */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Mapa de Destinos
                    </h2>
                    {/* Nota: InteractiveMap necesita ser actualizado para aceptar Place[] si no lo es ya */}
                    <InteractiveMap
                        destinations={destinations as any[]}
                        onMarkerClick={handleMarkerClick}
                        highlightedDestination={highlightedDestination}
                    />
                </div>

                {/* Destinations Grid */}
                <div id="destinations-grid" className="mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-eco-teal-500 text-xl">📍</span>
                        <h2 className="text-2xl font-bold text-gray-800">
                            Todos los Destinos
                            <span className="ml-3 text-lg font-normal text-gray-500">
                                ({destinations.length} {destinations.length === 1 ? 'destino' : 'destinos'})
                            </span>
                        </h2>
                    </div>

                    {destinations.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">No se encontraron destinos</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
                    <p>© 2025 EcoTurismo Risaralda. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
