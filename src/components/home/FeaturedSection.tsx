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
        <div className="mb-12 space-y-16">
            {/* Featured Section */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-3xl font-bold text-eco-primary-900 font-display">
                        Recomendados Especialmente
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                <div className="flex items-center gap-3 mb-8">
                    <h2 className="text-3xl font-bold text-eco-primary-900 font-display">
                        Mejor Valorados
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
