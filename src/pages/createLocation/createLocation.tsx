import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createLocation } from '@/api/locations/post';

const DEFAULT_CENTER: [number, number] = [51.5074, -0.1278]; // London
const DEFAULT_ZOOM = 12;

export interface CreatedLocation {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  explanation?: string;
}

const CreateLocation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [name, setName] = useState('');
  const [explanation, setExplanation] = useState('');
  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [createdLocations, setCreatedLocations] = useState<CreatedLocation[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageError, setMessageError] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Init map and click-to-select
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        setMapError(null);

        try {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
          });
        } catch (_) {}

        const container = mapContainerRef.current
        if (!mapRef.current && container) {
          mapRef.current = L.map(container, {
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            scrollWheelZoom: true,
          });

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);

          mapRef.current.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            setSelectedLat(lat);
            setSelectedLng(lng);
          });
        }
      } catch (err) {
        console.error('Map init error:', err);
        setMapError('Failed to load map');
      }
    };

    initMap();
    return () => {
      if (mapRef.current) {
        mapRef.current.off('click');
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when selected point or created locations change
  useEffect(() => {
    if (!mapRef.current) return;

    const updateMarkers = async () => {
      const L = await import('leaflet');
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const icon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
      });

      // Marker for current selection (draft)
      if (selectedLat != null && selectedLng != null) {
        const m = L.marker([selectedLat, selectedLng], { icon }).addTo(mapRef.current);
        m.bindPopup(
          `<div style="padding:8px;"><strong>${t('locations.selectedPoint') ?? 'Selected point'}</strong><br/><span style="font-size:12px;color:#666">${selectedLat.toFixed(6)}, ${selectedLng.toFixed(6)}</span></div>`
        );
        markersRef.current.push(m);
      }

      // Markers for created locations
      createdLocations.forEach((loc) => {
        const m = L.marker([loc.latitude, loc.longitude], { icon }).addTo(mapRef.current);
        const popup = `<div style="padding:8px;min-width:160px;"><strong>${loc.name}</strong>${loc.explanation ? `<br/><span style="font-size:12px;color:#666">${loc.explanation.slice(0, 80)}${loc.explanation.length > 80 ? '…' : ''}</span>` : ''}</div>`;
        m.bindPopup(popup);
        markersRef.current.push(m);
      });

      // Fit bounds if we have points
      const all: [number, number][] = [];
      if (selectedLat != null && selectedLng != null) all.push([selectedLat, selectedLng]);
      createdLocations.forEach((l) => all.push([l.latitude, l.longitude]));
      if (all.length > 0) {
        const L = await import('leaflet');
        mapRef.current.fitBounds(L.latLngBounds(all), { padding: [40, 40], maxZoom: 16 });
      }
    };

    updateMarkers();
  }, [selectedLat, selectedLng, createdLocations, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageError(false);

    if (!name.trim()) {
      setMessage(t('locations.nameRequired') ?? 'Please enter a location name.');
      setMessageError(true);
      return;
    }
    if (selectedLat == null || selectedLng == null) {
      setMessage(t('locations.clickMapRequired') ?? 'Please click on the map to select a location.');
      setMessageError(true);
      return;
    }

    setSaving(true);
    try {
      const result = await createLocation({
        name: name.trim(),
        latitude: String(selectedLat),
        longitude: String(selectedLng),
        explanation: explanation.trim() || '',
      });
      const newLoc: CreatedLocation = {
        id: result?.id,
        name: name.trim(),
        latitude: selectedLat,
        longitude: selectedLng,
        explanation: explanation.trim() || undefined,
      };
      setCreatedLocations((prev) => [...prev, newLoc]);
      setMessage(t('locations.created') ?? 'Location created.');
      setMessageError(false);
      setName('');
      setExplanation('');
      setSelectedLat(null);
      setSelectedLng(null);
    } catch (err) {
      console.error('Create location failed:', err);
      setMessage(t('locations.createError') ?? 'Failed to create location. Try again.');
      setMessageError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('common.back')}
        </Button>
        <h1 className="text-3xl font-bold mb-2">{t('locations.createLocation')}</h1>
        <p className="text-muted-foreground">
          {t('locations.createLocationHint') ?? 'Click on the map to choose a point, then fill in the name and description.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>{t('locations.selectOnMap')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {mapError ? (
              <div className="w-full h-[400px] flex items-center justify-center bg-muted rounded-b-lg">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">{mapError}</p>
                </div>
              </div>
            ) : (
              <div
                ref={mapContainerRef}
                className="w-full h-[400px] rounded-b-lg overflow-hidden bg-muted cursor-crosshair"
                style={{ minHeight: '400px' }}
              />
            )}
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('locations.details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="locName">{t('locations.name')} *</Label>
                <Input
                  id="locName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Leadenhall Market"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="locExplanation">{t('locations.explanation')}</Label>
                <textarea
                  id="locExplanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="e.g., Historical, Victorian indoor marketplace..."
                  rows={4}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring mt-1"
                />
              </div>
              {selectedLat != null && selectedLng != null && (
                <p className="text-xs text-muted-foreground">
                  {t('locations.coordinates')}: {selectedLat.toFixed(6)}, {selectedLng.toFixed(6)}
                </p>
              )}
              {message && (
                <p className={`text-sm ${messageError ? 'text-destructive' : 'text-emerald-600'}`}>
                  {message}
                </p>
              )}
              <Button type="submit" disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? t('common.saving') : t('locations.createLocation')}
              </Button>
            </form>

            {createdLocations.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm font-medium mb-2">
                  {t('locations.yourLocations')} ({createdLocations.length})
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {createdLocations.map((loc, i) => (
                    <li key={loc.id ?? i}>
                      {loc.name}
                      {loc.explanation ? ` — ${loc.explanation.slice(0, 40)}…` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateLocation;
