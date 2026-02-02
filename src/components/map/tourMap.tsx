import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TourMapProps {
  latitude: number;
  longitude: number;
  cityName?: string;
  tourName?: string;
}

export const TourMap = ({ latitude, longitude, cityName, tourName }: TourMapProps) => {
  const { t } = useTranslation();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
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
          // Icon already configured or error occurred
        }

        // Initialize map if not already initialized
        const container = mapContainerRef.current
        if (!mapRef.current && container) {
          mapRef.current = L.map(container, {
            center: [latitude, longitude],
            zoom: 13,
            scrollWheelZoom: false,
          });

          // Add OpenStreetMap tile layer
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);

          // Create custom icon
          const customIcon = L.icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41],
          });

          // Add marker
          markerRef.current = L.marker([latitude, longitude], {
            icon: customIcon,
          }).addTo(mapRef.current);

          // Add popup with tour info
          const popupContent = `
            <div style="padding: 8px;">
              <strong>${tourName || cityName || 'Location'}</strong>
              ${cityName ? `<br><span style="color: #666; font-size: 12px;">${cityName}</span>` : ''}
            </div>
          `;
          markerRef.current.bindPopup(popupContent).openPopup();
        } else {
          // Update map center and marker position if map already exists
          mapRef.current.setView([latitude, longitude], 13);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
            const popupContent = `
              <div style="padding: 8px;">
                <strong>${tourName || cityName || 'Location'}</strong>
                ${cityName ? `<br><span style="color: #666; font-size: 12px;">${cityName}</span>` : ''}
              </div>
            `;
            markerRef.current.setPopupContent(popupContent).openPopup();
          }
        }
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to load map');
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [latitude, longitude, cityName, tourName]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <CardTitle>{t('tours.location')}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {mapError ? (
          <div className="w-full h-[400px] rounded-b-lg flex items-center justify-center bg-muted">
            <div className="text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">{mapError}</p>
            </div>
          </div>
        ) : (
          <div 
            ref={mapContainerRef} 
            className="w-full h-[400px] rounded-b-lg overflow-hidden bg-muted"
            style={{ minHeight: '400px' }}
          />
        )}
      </CardContent>
    </Card>
  );
};
