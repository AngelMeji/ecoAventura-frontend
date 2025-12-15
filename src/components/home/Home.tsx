import React, { useState, useEffect } from 'react';
import InteractiveMap from '../map/InteractiveMap';
import DestinationCard from '../destination/DestinationCard';
import FilterBar from './FilterBar';
import Header from '../layout/Header';
import { destinations, getDestinationsByCategory, searchDestinations } from '../../data/destinations';
import type { Destination } from '../../types/destination';

const Home: React.FC = () => {
    const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>(destinations);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [highlightedDestination, setHighlightedDestination] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Apply filters
        let result = destinations;

        if (searchQuery) {
            result = searchDestinations(searchQuery);
        } else if (activeCategory !== 'Todos') {
            result = getDestinationsByCategory(activeCategory);
        }

        setFilteredDestinations(result);
    }, [activeCategory, searchQuery]);

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setActiveCategory('Todos'); // Reset category when searching
    };

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        setSearchQuery(''); // Reset search when changing category
    };

    const handleMarkerClick = (destinationId: number) => {
        setHighlightedDestination(destinationId);

        // Scroll to the corresponding card
        const cardElement = document.getElementById(`destination-${destinationId}`);
        if (cardElement) {
            cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Remove highlight after 3 seconds
        setTimeout(() => {
            setHighlightedDestination(null);
        }, 3000);
    };

    const handleCardClick = (destinationId: number) => {
        setHighlightedDestination(destinationId);

        // Scroll to top to see the map
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Remove highlight after 3 seconds
        setTimeout(() => {
            setHighlightedDestination(null);
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-eco-bg">
            {/* Header */}
            <Header />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        Explora Destinos Ecoturísticos
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                        Descubre los lugares más hermosos y sostenibles para tu próxima aventura
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg className="w-5 h-5 text-eco-teal-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>Guía de cuenta para gestionar tus destinos favoritos y planear tu itinerario</span>
                    </div>
                </div>

                {/* Filters */}
                <FilterBar
                    onSearchChange={handleSearchChange}
                    onCategoryChange={handleCategoryChange}
                    activeCategory={activeCategory}
                />

                {/* Map Section */}
                <div className="mb-8">
                    <InteractiveMap
                        destinations={filteredDestinations}
                        onMarkerClick={handleMarkerClick}
                        highlightedDestination={highlightedDestination}
                    />
                </div>

                {/* Destinations Grid */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                        Todos los Destinos
                        <span className="ml-3 text-lg font-normal text-gray-500">
                            ({filteredDestinations.length} {filteredDestinations.length === 1 ? 'destino' : 'destinos'})
                        </span>
                    </h2>

                    {filteredDestinations.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-600 text-lg">No se encontraron destinos</p>
                            <p className="text-gray-500 text-sm mt-2">Intenta con otros filtros o búsqueda</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredDestinations.map((destination) => (
                                <div
                                    key={destination.id}
                                    id={`destination-${destination.id}`}
                                >
                                    <DestinationCard
                                        destination={destination}
                                        isHighlighted={highlightedDestination === destination.id}
                                        onClick={() => handleCardClick(destination.id)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
                    <p>© 2025 EcoTurismo Risaralda. Todos los derechos reservados.</p>
                    <p className="mt-2">Promoviendo el turismo sostenible en Colombia 🌿</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
