import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon with teal color
const createCustomIcon = () => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
      <div style="
        background-color: #14b8a6;
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background-color: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

interface InteractiveMapProps {
    destinations: any[]; // Loosened for build
    onMarkerClick?: (destinationId: number) => void;
    highlightedDestination?: number | null;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({
    destinations,
    onMarkerClick
}) => {
    const mapRef = useRef<L.Map>(null);

    // Center of Risaralda, Colombia
    const center: [number, number] = [4.8, -75.6];

    const handleMarkerClick = (destinationId: number) => {
        if (onMarkerClick) {
            onMarkerClick(destinationId);
        }
    };

    return (
        <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg relative">
            {/* Legend */}
            <div className="absolute top-4 left-4 z-[400] bg-white rounded-lg shadow-md p-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Leyenda</h4>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-4 h-4 bg-eco-teal-500 rounded-full border-2 border-white shadow"></div>
                    <span>Destinos disponibles</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Haz clic en los marcadores para ver detalles
                </p>
            </div>

            <MapContainer
                center={center}
                zoom={10}
                scrollWheelZoom={true}
                className="w-full h-full"
                ref={mapRef}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {destinations.map((destination) => (
                    <Marker
                        key={destination.id}
                        position={[Number((destination as any).latitude), Number((destination as any).longitude)]}
                        icon={createCustomIcon()}
                        eventHandlers={{
                            click: () => handleMarkerClick(destination.id),
                        }}
                    >
                        <Popup className="custom-popup">
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-bold text-gray-800 mb-1">
                                    {destination.name}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                    {destination.short_description}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <span className="px-2 py-1 bg-eco-teal-100 text-eco-teal-700 rounded-full">
                                        {destination.category?.name || 'General'}
                                    </span>
                                    <span className="capitalize">{destination.difficulty}</span>
                                </div>
                                <button
                                    onClick={() => window.location.href = `/place/${(destination as any).slug || destination.id}`}
                                    className="text-eco-teal-600 hover:text-eco-teal-700 text-sm font-medium"
                                    type="button"
                                >
                                    Ver detalles →
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default InteractiveMap;
