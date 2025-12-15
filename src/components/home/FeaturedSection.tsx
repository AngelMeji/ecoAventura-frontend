import React from 'react';
import DestinationCard from '../destination/DestinationCard';

interface FeaturedSectionProps {
    featuredDestinations: any[];
    popularDestinations: any[];
    onDestinationClick: (id: number) => void;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({
    featuredDestinations,
    popularDestinations,
    onDestinationClick
}) => {
    return (
        <div className="mb-10 space-y-10">
            {/* Featured Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-yellow-500 text-xl">★</span>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Recomendados Especialmente
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredDestinations.map(destination => (
                        <DestinationCard
                            key={destination.id}
                            destination={destination as any}
                            onClick={() => onDestinationClick(destination.id)}
                            isHighlighted={false}
                        />
                    ))}
                </div>
            </section>

            {/* Popular Section */}
            <section>
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-eco-teal-500 text-xl">⚡</span>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Mejor Valorados
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {popularDestinations.map(destination => (
                        <DestinationCard
                            key={destination.id}
                            destination={destination as any}
                            onClick={() => onDestinationClick(destination.id)}
                            isHighlighted={false}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default FeaturedSection;
