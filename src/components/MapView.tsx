
/// <reference types="google.maps" />
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Business } from '../types';

interface MapViewProps {
  businesses: Business[];
  userLocation: { latitude: number; longitude: number } | null;
  onSelect: (business: Business) => void;
}

export const MapView: React.FC<MapViewProps> = ({ businesses, userLocation, onSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map if not already done
    if (!mapInstance.current) {
        const defaultCenter = { lat: 10.8505, lng: 76.2711 }; // Kerala approx
        const zoom = 7;
        
        mapInstance.current = new google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: zoom,
            styles: [
                { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                {
                  featureType: "administrative.locality",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }],
                },
                {
                  featureType: "poi",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "geometry",
                  stylers: [{ color: "#263c3f" }],
                },
                {
                  featureType: "poi.park",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#6b9a76" }],
                },
                {
                  featureType: "road",
                  elementType: "geometry",
                  stylers: [{ color: "#38414e" }],
                },
                {
                  featureType: "road",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#212a37" }],
                },
                {
                  featureType: "road",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#9ca5b3" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry",
                  stylers: [{ color: "#746855" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "geometry.stroke",
                  stylers: [{ color: "#1f2835" }],
                },
                {
                  featureType: "road.highway",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#f3d19c" }],
                },
                {
                  featureType: "transit",
                  elementType: "geometry",
                  stylers: [{ color: "#2f3948" }],
                },
                {
                  featureType: "transit.station",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#d59563" }],
                },
                {
                  featureType: "water",
                  elementType: "geometry",
                  stylers: [{ color: "#17263c" }],
                },
                {
                  featureType: "water",
                  elementType: "labels.text.fill",
                  stylers: [{ color: "#515c6d" }],
                },
                {
                  featureType: "water",
                  elementType: "labels.text.stroke",
                  stylers: [{ color: "#17263c" }],
                },
              ],
        });
    }

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    // Add User Location Marker
    if (userLocation) {
        const userPos = { lat: userLocation.latitude, lng: userLocation.longitude };
        const userMarker = new google.maps.Marker({
            position: userPos,
            map: mapInstance.current,
            title: "You are here",
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#3B82F6",
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
            }
        });
        
        const infoWindow = new google.maps.InfoWindow({
            content: "<b>You are here</b>"
        });
        
        userMarker.addListener("click", () => {
            infoWindow.open(mapInstance.current, userMarker);
        });

        markersRef.current.push(userMarker);
        bounds.extend(userPos);
    }

    // Add Business Markers
    businesses.forEach((biz) => {
        if (biz.latitude && biz.longitude) {
            const bizPos = { lat: biz.latitude, lng: biz.longitude };
            const marker = new google.maps.Marker({
                position: bizPos,
                map: mapInstance.current,
                title: biz.name,
                // Default red marker is fine, or custom icon could be used
            });

            const contentString = `
                <div style="color: black; padding: 5px;">
                    <h3 style="font-weight: bold; margin-bottom: 5px;">${biz.name}</h3>
                    <p style="font-size: 12px; color: #555; margin-bottom: 5px;">${biz.category}</p>
                    <p style="font-size: 12px; color: #777; margin-bottom: 8px;">${biz.location}</p>
                    <button id="select-btn-${biz.name.replace(/\s+/g, '-')}" style="background-color: #059669; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; width: 100%;">Select</button>
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${biz.latitude},${biz.longitude}" target="_blank" style="display: block; text-align: center; margin-top: 5px; color: #3B82F6; font-size: 12px; text-decoration: none;">Get Directions</a>
                </div>
            `;

            const infoWindow = new google.maps.InfoWindow({
                content: contentString
            });

            marker.addListener("click", () => {
                infoWindow.open(mapInstance.current, marker);
                
                // Add event listener after the info window is ready
                setTimeout(() => {
                    const btn = document.getElementById(`select-btn-${biz.name.replace(/\s+/g, '-')}`);
                    if (btn) {
                        btn.onclick = () => onSelect(biz);
                    }
                }, 100);
            });
            
            markersRef.current.push(marker);
            bounds.extend(bizPos);
        }
    });

    // Fit bounds only if we have markers or user location
    if (markersRef.current.length > 0) {
        mapInstance.current.fitBounds(bounds);
    } else if (!userLocation) {
        // Fallback view if no markers
        mapInstance.current.setCenter({ lat: 10.8505, lng: 76.2711 });
        mapInstance.current.setZoom(7);
    }

  }, [businesses, userLocation, onSelect]);

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden border border-slate-700 shadow-lg z-0">
        <div ref={mapRef} className="w-full h-full bg-slate-900" />
    </div>
  );
};
