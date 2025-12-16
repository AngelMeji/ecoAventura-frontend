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
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="relative w-24 h-24 mb-4">
                    <div className="absolute inset-0 bg-eco-primary-200 rounded-full animate-ping opacity-25"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-xl flex items-center justify-center">
                        <svg className="w-12 h-12 text-eco-primary-600 animate-pulse-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                </div>
                <p className="text-xl font-display font-bold text-eco-primary-800 animate-pulse">Cargando...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-eco-light">
            <Header />

            <main className="container mx-auto px-4 py-8 space-y-16">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-eco-primary-900 shadow-xl animate-fade-in-up">
                    <div className="absolute inset-0 bg-[url('/assets/hero_background_colombia.png')] bg-cover bg-center"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
                    <div className="relative px-8 py-20 md:px-12 md:py-24 text-white max-w-2xl">
                        <span className="text-eco-accent font-bold tracking-wider uppercase mb-2 block drop-shadow-md">Descubre Colombia</span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 drop-shadow-lg">
                            Explora Paraísos <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-blue-400 to-red-400">Ecoturísticos</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed drop-shadow-md font-medium">
                            Sumérgete en la magia de la biodiversidad. Encuentra los destinos más hermosos y sostenibles para tu próxima aventura en la naturaleza.
                        </p>
                        <button
                            onClick={() => document.getElementById('destinations-grid')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-eco-accent hover:bg-eco-accent-hover text-eco-primary-900 font-bold rounded-full transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                        >
                            Comenzar Aventura
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>
                </div>

                <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <FilterBar
                        onSearchChange={handleSearchChange}
                        activeCategory={activeCategory}
                    />
                </div>

                {!searchQuery && (
                    <CategorySection
                        categories={categoryStats}
                        activeCategory={activeCategory}
                        onCategoryChange={handleCategoryChange}
                    />
                )}

                {/* Featured Section */}
                {!searchQuery && activeCategory === 'Todos' && featuredDestinations.length > 0 && (
                    <FeaturedSection
                        featuredDestinations={featuredDestinations}
                        popularDestinations={popularDestinations}
                        onDestinationClick={handleCardClick}
                    />
                )}

                {/* Map Section */}
                <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-eco-primary-100 rounded-lg text-eco-primary-700">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-display font-bold text-gray-800">
                                Mapa de Destinos
                            </h2>
                            <p className="text-gray-500">Ubica tu próxima experiencia</p>
                        </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white ring-1 ring-gray-100">
                        <InteractiveMap
                            destinations={destinations as any[]}
                            onMarkerClick={handleMarkerClick}
                            highlightedDestination={highlightedDestination}
                        />
                    </div>
                </div>

                {/* Destinations Grid */}
                <div id="destinations-grid" className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-eco-primary-100 rounded-lg text-eco-primary-700">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </div>
                        <div>
                            <h2 className="text-3xl font-display font-bold text-gray-800">
                                Todos los Destinos
                            </h2>
                            <p className="text-gray-500">
                                {destinations.length} {destinations.length === 1 ? 'destino encontrado' : 'destinos encontrados'}
                            </p>
                        </div>
                    </div>

                    {destinations.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                            <div className="text-eco-primary-200 mb-4 flex justify-center">
                                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No encontramos destinos</h3>
                            <p className="text-gray-500">Intenta con otra búsqueda o categoría</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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

            <footer className="bg-white border-t border-gray-100 mt-20">
                <div className="container mx-auto px-6 py-12 text-center">
                    <div className="flex justify-center mb-6">
                        {/* Optional Footer Logo */}
                        <span className="text-2xl font-display font-bold text-eco-primary-800">EcoAventura</span>
                    </div>
                    <div className="flex justify-center gap-6 mb-8 text-gray-500">
                        <a href="#" className="hover:text-eco-primary-600">Inicio</a>
                        <a href="#" className="hover:text-eco-primary-600">Destinos</a>
                        <a href="#" className="hover:text-eco-primary-600">Blog</a>
                        <a href="#" className="hover:text-eco-primary-600">Contacto</a>
                    </div>
                    <p className="text-gray-400 text-sm">© 2025 EcoTurismo Colombia. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
