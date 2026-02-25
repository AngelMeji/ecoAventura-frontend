import React, { useState, useEffect } from 'react';
import InteractiveMap from '../components/map/InteractiveMap';
import DestinationCard from '../components/destination/DestinationCard';
import FilterBar from '../components/home/FilterBar';
import Header from '../components/layout/Header';
import CategorySection from '../components/home/CategorySection';
import { DestinationController } from '../controllers/Destination.controller';
import type { Place, PaginatedResponse } from '../models/Place.model'; // Usamos el nuevo modelo Place
import DestinationModal from '../components/destination/DestinationModal';
import Footer from '../components/layout/Footer';
import { useLanguage } from '../context/LanguageContext';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

/**
 * Vista principal - Home
 * Muestra el mapa interactivo y los destinos ecoturísticos cargados del backend
 */
const Home: React.FC = () => {
    const [allDestinations, setAllDestinations] = useState<Place[]>([]);
    const [destinations, setDestinations] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [highlightedDestination, setHighlightedDestination] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState<Place | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState<any>(null);
    const [categoryStats, setCategoryStats] = useState<any[]>([]);
    const { t } = useLanguage();
    const navigate = useNavigate();

    const ITEMS_PER_PAGE = 12;

    // Cargar datos al inicio
    useEffect(() => {
        loadData();
    }, []);

    // Cargar datos cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
        fetchDestinations();
    }, [activeCategory, searchQuery]);

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

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchDestinations(),
                DestinationController.getCategoryStats().then(setCategoryStats),
            ]);
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDestinations = async () => {
        setLoading(true);
        try {
            let allFetched: Place[] = [];
            let pageToFetch = 1;
            let hasMore = true;

            while (hasMore) {
                let response: PaginatedResponse<Place>;
                // Intentamos pedir 100, pero si el servidor nos ignora y da 10, seguiremos pidiendo páginas
                if (searchQuery) {
                    response = await DestinationController.searchDestinations(searchQuery, pageToFetch, 100);
                } else {
                    response = await DestinationController.getDestinationsByCategory(activeCategory, pageToFetch, 100);
                }

                // Evitar duplicados si el backend no pagina bien o devuelve lo mismo
                const newItems = response.data.filter(newItem =>
                    !allFetched.some(existingItem => existingItem.id === newItem.id)
                );

                allFetched = [...allFetched, ...newItems];

                // Si la página actual es menor a la última devuelta por el backend
                if (response.current_page < response.last_page) {
                    pageToFetch++;
                } else {
                    hasMore = false;
                }
            }

            setAllDestinations(allFetched);
        } catch (error) {
            console.error('Error buscando destinos:', error);
            setAllDestinations([]);
        } finally {
            setLoading(false);
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

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setActiveCategory('Todos');
    };

    const handleCategoryChange = (category: string) => {
        setLoading(true); // Mostrar loader
        setActiveCategory(category);
        setSearchQuery('');

        // Scroll to grid
        const gridElement = document.getElementById('destinations-grid');
        if (gridElement) {
            gridElement.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleMarkerClick = async (destinationId: number) => {
        // Abrir modal para TODOS los usuarios (con o sin login)
        try {
            const destination = await DestinationController.getDestinationById(destinationId);
            if (destination) {
                setSelectedDestination(destination);
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error('Error al abrir modal desde el mapa:', error);
        }
    };

    const handleCardClick = async (destinationId: number) => {
        if (authService.isAuthenticated()) {
            navigate(`/place/${destinationId}`);
        } else {
            try {
                const destination = await DestinationController.getDestinationById(destinationId);
                if (destination) {
                    setSelectedDestination(destination);
                    setIsModalOpen(true);
                }
            } catch (error) {
                console.error('Error al abrir detalle:', error);
            }
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedDestination(null);
    };

    const renderMapSection = () => (
        <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-eco-primary-100 rounded-lg text-eco-primary-700">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                </div>
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-800">
                        {t('home.map.title')}
                    </h2>
                    <p className="text-gray-500">{t('home.map.subtitle')}</p>
                </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg border-4 border-white ring-1 ring-gray-100">
                <InteractiveMap
                    destinations={allDestinations as any[]}
                    onMarkerClick={handleMarkerClick}
                    highlightedDestination={highlightedDestination}
                    shouldAutoFit={false}
                />
            </div>
        </div>
    );

    const renderDestinationsGrid = () => (
        <div id="destinations-grid" className="animate-fade-in-up" style={{ animationDelay: searchQuery ? '0.2s' : '0.4s' }}>
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-eco-primary-100 rounded-lg text-eco-primary-700">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                    <h2 className="text-3xl font-display font-bold text-gray-800">
                        {searchQuery ? t('home.grid.searchResults') : (loading ? t('home.grid.searching') : t('home.grid.allDestinations'))}
                    </h2>
                    {!loading && (
                        <p className="text-gray-500">
                            {destinations.length} {destinations.length === 1 ? t('home.grid.found_one') : t('home.grid.found_other')}
                        </p>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-eco-primary-600 mb-4"></div>
                    <p className="text-gray-500">{t('home.grid.loading')}</p>
                </div>
            ) : (
                destinations.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                        <div className="text-eco-primary-200 mb-4 flex justify-center">
                            <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t('home.grid.noResultsTitle')}</h3>
                        <p className="text-gray-500">{t('home.grid.noResultsDesc')}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-8">
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
                    </>
                )
            )}
        </div>
    );

    // Loading se manejará inline para no desmontar todo el layout
    // if (loading) { return ... }  <-- REMOVED

    return (
        <div className="min-h-screen bg-eco-light">
            <Header />

            <main className="container mx-auto px-4 py-8 space-y-16">
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-eco-primary-900 shadow-xl animate-fade-in-up">
                    <div className="absolute inset-0 bg-[url('/assets/risaralda_hero.png')] bg-cover bg-center"></div>
                    {/* Green gradient fade from left (text side) to transparent right (image side) */}
                    <div className="absolute inset-0 bg-gradient-to-r from-eco-primary-900 via-eco-primary-900/70 to-transparent"></div>
                    <div className="relative px-8 py-20 md:px-12 md:py-24 text-white max-w-2xl">
                        <span className="text-eco-accent font-bold tracking-wider uppercase mb-2 block drop-shadow-md">{t('home.hero.subtitle')}</span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6 drop-shadow-lg">
                            {t('home.hero.title')} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-blue-400 to-red-400">{t('home.hero.highlight')}</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-100 mb-8 leading-relaxed drop-shadow-md font-medium">
                            {t('home.hero.description')}
                        </p>
                        <button
                            onClick={() => document.getElementById('destinations-grid')?.scrollIntoView({ behavior: 'smooth' })}
                            className="px-8 py-4 bg-eco-accent hover:bg-eco-accent-hover text-eco-primary-900 font-bold rounded-full transition-all hover:scale-105 shadow-lg flex items-center gap-2"
                        >
                            {t('home.hero.cta')}
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

                {/* Content Sections - Reordered if searching */}
                {searchQuery ? (
                    <>
                        {/* 1. Results first when searching */}
                        {renderDestinationsGrid()}

                        {/* 2. Map second when searching */}
                        {renderMapSection()}
                    </>
                ) : (
                    <>
                        {/* 1. Map first when not searching */}
                        {renderMapSection()}

                        {/* 2. Grid second when not searching */}
                        {renderDestinationsGrid()}
                    </>
                )}
            </main>

            {selectedDestination && (
                <DestinationModal
                    destination={selectedDestination}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}

            <Footer />
        </div>
    );
};

export default Home;
