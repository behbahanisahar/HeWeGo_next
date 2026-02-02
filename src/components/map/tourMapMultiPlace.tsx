import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ITourPlace } from '@/entities/tourPlace';

interface TourMapMultiPlaceProps {
  places: ITourPlace[];
  tourName?: string;
  cityName?: string;
}

export const TourMapMultiPlace = ({ places, tourName, cityName }: TourMapMultiPlaceProps) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !places || places.length === 0) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        setMapError(null);

        // Fix for default marker icon issue in Vite
        try {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });
        } catch (e) {
          // Icon already configured
        }

        // Sort places by order
        const sortedPlaces = [...places].sort((a, b) => a.order - b.order);

        // Calculate bounds to fit all markers
        const bounds = L.latLngBounds(
          sortedPlaces.map(place => [place.latitude, place.longitude])
        );

        const container = mapContainerRef.current
        if (!mapRef.current && container) {
          mapRef.current = L.map(container, {
            scrollWheelZoom: false,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);

          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        } else {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }

        // Clear existing markers and polyline
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        if (polylineRef.current) {
          polylineRef.current.remove();
        }

        // Create custom icons for start, middle, and end
        const startIcon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        const endIcon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
        });

        // Add markers for each place
        sortedPlaces.forEach((place, index) => {
          const isStart = index === 0;
          const isEnd = index === sortedPlaces.length - 1;
          
          const icon = isStart || isEnd ? (isStart ? startIcon : endIcon) : startIcon;
          
          const marker = L.marker([place.latitude, place.longitude], {
            icon: icon,
          }).addTo(mapRef.current);

          const popupContent = `
            <div style="padding: 8px; min-width: 150px;">
              <strong>${place.name}</strong>
              ${place.description ? `<br><span style="color: #666; font-size: 12px;">${place.description}</span>` : ''}
              ${place.estimatedTime ? `<br><span style="color: #666; font-size: 11px;">⏱ ${place.estimatedTime} min</span>` : ''}
            </div>
          `;
          marker.bindPopup(popupContent);
          
          if (isStart) {
            marker.openPopup();
          }
          
          markersRef.current.push(marker);
        });

        // Draw route polyline connecting all places
        if (sortedPlaces.length > 1) {
          const routeCoordinates = sortedPlaces.map(place => [place.latitude, place.longitude] as [number, number]);
          
          polylineRef.current = L.polyline(routeCoordinates, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.7,
            smoothFactor: 1,
          }).addTo(mapRef.current);
        }

      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to load map');
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        if (polylineRef.current) {
          polylineRef.current.remove();
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [places, tourName, cityName]);

  if (!places || places.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle>{t('tours.tourRoute')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {mapError ? (
          <div className="w-full h-[500px] rounded-b-lg flex items-center justify-center bg-muted">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">{mapError}</p>
            </div>
          </div>
        ) : (
          <div 
            ref={mapContainerRef} 
            className="w-full h-[500px] rounded-b-lg overflow-hidden bg-muted"
            style={{ minHeight: '500px' }}
          />
        )}
      </CardContent>
    </Card>
  );
};
