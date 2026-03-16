
import * as React from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Business } from '../types';

interface MapProps {
    businesses: Business[];
    center?: { lat: number; lng: number };
    zoom?: number;
}

const containerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '1.5rem',
    overflow: 'hidden'
};

const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629 // Center of India
};

export const GoogleMapComponent: React.FC<MapProps> = ({ businesses, center, zoom = 5 }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
    });

    const [selected, setSelected] = React.useState<Business | null>(null);

    const mapCenter = React.useMemo(() => {
        if (center) return center;
        if (businesses.length > 0 && businesses[0].latitude && businesses[0].longitude) {
            return { lat: businesses[0].latitude, lng: businesses[0].longitude };
        }
        return defaultCenter;
    }, [businesses, center]);

    const mapZoom = React.useMemo(() => {
        if (center) return 12;
        if (businesses.length > 0) return 10;
        return zoom;
    }, [businesses, center, zoom]);

    if (!isLoaded) return <div className="h-[400px] w-full bg-slate-900 animate-pulse rounded-3xl flex items-center justify-center text-slate-500 font-mono text-xs">Loading Maps Engine...</div>;

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={mapZoom}
            options={{
                styles: [
                    {
                        "elementType": "geometry",
                        "stylers": [{ "color": "#1e293b" }]
                    },
                    {
                        "elementType": "labels.text.fill",
                        "stylers": [{ "color": "#94a3b8" }]
                    },
                    {
                        "elementType": "labels.text.stroke",
                        "stylers": [{ "color": "#0f172a" }]
                    },
                    {
                        "featureType": "administrative",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#334155" }]
                    },
                    {
                        "featureType": "landscape.man_made",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#334155" }]
                    },
                    {
                        "featureType": "poi",
                        "elementType": "geometry.fill",
                        "stylers": [{ "color": "#1e293b" }]
                    },
                    {
                        "featureType": "road",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#0f172a" }]
                    },
                    {
                        "featureType": "road",
                        "elementType": "geometry.stroke",
                        "stylers": [{ "color": "#1e293b" }]
                    },
                    {
                        "featureType": "water",
                        "elementType": "geometry",
                        "stylers": [{ "color": "#020617" }]
                    }
                ],
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true
            }}
        >
            {businesses.map((biz, idx) => (
                biz.latitude && biz.longitude && (
                    <Marker
                        key={`${biz.name}-${idx}`}
                        position={{ lat: biz.latitude, lng: biz.longitude }}
                        onClick={() => setSelected(biz)}
                        icon={{
                            path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                            fillColor: "#10b981",
                            fillOpacity: 1,
                            strokeWeight: 1,
                            strokeColor: "#ffffff",
                            scale: 1.5,
                            anchor: new google.maps.Point(12, 22)
                        }}
                    />
                )
            ))}

            {selected && selected.latitude && selected.longitude && (
                <InfoWindow
                    position={{ lat: selected.latitude, lng: selected.longitude }}
                    onCloseClick={() => setSelected(null)}
                >
                    <div className="p-3 min-w-[220px] bg-white text-slate-900 rounded-xl shadow-xl border border-slate-100">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h4 className="font-black text-sm text-slate-900 leading-tight">{selected.name}</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{selected.category}</p>
                            </div>
                            {selected.rating && (
                                <div className="flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                                    <span className="text-[10px] font-black text-emerald-700">{selected.rating} ★</span>
                                </div>
                            )}
                        </div>
                        
                        <p className="text-[11px] text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                            {selected.description || selected.location}
                        </p>

                        <div className="flex gap-2">
                            <a 
                                href={`https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-lg text-center transition-colors flex items-center justify-center gap-1.5"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Directions
                            </a>
                            {selected.mapUrl && (
                                <a 
                                    href={selected.mapUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg flex items-center justify-center transition-colors"
                                    title="View on Maps"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            )}
                        </div>
                    </div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
};
