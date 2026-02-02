import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Save, MapPin, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createTour } from '@/api/tour/post';
import { getAllCities } from '@/api/cities/get';
import { getUserLocations } from '@/api/locations/get';
import { createLocation } from '@/api/locations/post';
import ICity from '@/entities/city';
import type { IUserLocation } from '@/api/locations/get';

const DEFAULT_MAP_CENTER: [number, number] = [51.5074, -0.1278];
const DEFAULT_MAP_ZOOM = 11;

const CreateTour = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [name, setName] = useState('');
  const [cityId, setCityId] = useState<number | ''>('');
  const [explanation, setExplanation] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [cities, setCities] = useState<ICity[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [userLocations, setUserLocations] = useState<IUserLocation[]>([]);
  const [userLocationsLoading, setUserLocationsLoading] = useState(true);
  const [selectedLocationIds, setSelectedLocationIds] = useState<Set<number>>(new Set());

  const [newLocLat, setNewLocLat] = useState<number | null>(null);
  const [newLocLng, setNewLocLng] = useState<number | null>(null);
  const [newLocName, setNewLocName] = useState('');
  const [newLocExplanation, setNewLocExplanation] = useState('');
  const [creatingLocation, setCreatingLocation] = useState(false);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageError, setMessageError] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    getAllCities()
      .then((list) => setCities(list))
      .catch(() => setCities([]))
      .finally(() => setCitiesLoading(false));
  }, []);

  const loadUserLocations = () => {
    setUserLocationsLoading(true);
    getUserLocations()
      .then((list) => setUserLocations(list))
      .catch(() => setUserLocations([]))
      .finally(() => setUserLocationsLoading(false));
  };

  useEffect(() => {
    loadUserLocations();
  }, []);

  // Map init and click
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
            center: DEFAULT_MAP_CENTER,
            zoom: DEFAULT_MAP_ZOOM,
            scrollWheelZoom: true,
          });
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapRef.current);
          mapRef.current.on('click', (e: any) => {
            setNewLocLat(e.latlng.lat);
            setNewLocLng(e.latlng.lng);
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

  // Update map markers: user locations + selected new point
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

      userLocations.forEach((loc) => {
        const m = L.marker([loc.latitude, loc.longitude], { icon }).addTo(mapRef.current);
        const popup = `<div style="padding:8px;min-width:140px;"><strong>${loc.name}</strong>${loc.explanation ? `<br/><span style="font-size:12px;color:#666">${loc.explanation.slice(0, 60)}…</span>` : ''}</div>`;
        m.bindPopup(popup);
        markersRef.current.push(m);
      });

      if (newLocLat != null && newLocLng != null) {
        const m = L.marker([newLocLat, newLocLng], { icon }).addTo(mapRef.current);
        m.bindPopup(`<div style="padding:8px;">${t('locations.selectedPoint')}</div>`);
        markersRef.current.push(m);
      }

      const all: [number, number][] = userLocations.map((l) => [l.latitude, l.longitude]);
      if (newLocLat != null && newLocLng != null) all.push([newLocLat, newLocLng]);
      if (all.length > 0) {
        mapRef.current.fitBounds(L.latLngBounds(all), { padding: [30, 30], maxZoom: 16 });
      }
    };

    updateMarkers();
  }, [userLocations, newLocLat, newLocLng, t]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const toggleLocationInTour = (id: number) => {
    setSelectedLocationIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateNewLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocLat == null || newLocLng == null || !newLocName.trim()) {
      setMessage(t('locations.nameRequired'));
      setMessageError(true);
      return;
    }
    setCreatingLocation(true);
    setMessage('');
    setMessageError(false);
    try {
      await createLocation({
        name: newLocName.trim(),
        latitude: String(newLocLat),
        longitude: String(newLocLng),
        explanation: newLocExplanation.trim() || '',
      });
      loadUserLocations();
      setNewLocName('');
      setNewLocExplanation('');
      setNewLocLat(null);
      setNewLocLng(null);
      setMessage(t('locations.created'));
      setMessageError(false);
    } catch (err) {
      console.error('Create location failed:', err);
      setMessage(t('locations.createError'));
      setMessageError(true);
    } finally {
      setCreatingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageError(false);

    if (!name.trim()) {
      setMessage(t('tours.createTourNameRequired') ?? 'Please enter a tour name.');
      setMessageError(true);
      return;
    }

    if (cityId === '' || cityId === 0) {
      setMessage(t('tours.createTourCityRequired') ?? 'Please select a city.');
      setMessageError(true);
      return;
    }

    setSaving(true);
    try {
      const result = await createTour({
        name: name.trim(),
        city: Number(cityId),
        explanation: explanation.trim() || '',
        tags,
        ...(selectedLocationIds.size > 0 && { location_ids: Array.from(selectedLocationIds) }),
      });
      setMessage(t('tours.tourCreated'));
      setMessageError(false);
      const newId = result?.id;
      if (typeof newId === 'number' && newId > 0) {
        navigate(`/tour/${newId}`);
      } else {
        navigate('/tour');
      }
    } catch (err) {
      console.error('Create tour failed:', err);
      setMessage(t('tours.createTourError') ?? 'Failed to create tour. Please try again.');
      setMessageError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('tours.createTour')}</h1>
        <p className="text-muted-foreground">
          Create a new tour with name, city, description, tags, and add your locations (or create new ones on the map).
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('tours.tourDetails')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="tourName">{t('tours.createTourName')} *</Label>
              <Input
                id="tourName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., City of London"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tourCity">{t('tours.createTourCity')} *</Label>
              <select
                id="tourCity"
                value={cityId === '' ? '' : cityId}
                onChange={(e) => setCityId(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={citiesLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 mt-1"
              >
                <option value="">
                  {citiesLoading ? t('common.loading') : t('tours.selectCity')}
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                    {city.country ? `, ${city.country.trim()}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="explanation">{t('tours.createTourExplanation')}</Label>
              <textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="e.g., Go around in historic City of London"
                rows={4}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tags">{t('tours.tags')}</Label>
              <div className="flex gap-2 mb-2 mt-1">
                <Input
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="e.g., history, London"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tour locations: user locations + create new */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>{t('tours.tourRoute')} / {t('locations.yourLocations')}</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t('locations.createLocationHint')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Map */}
            {mapError ? (
              <div className="w-full h-[320px] rounded-lg flex items-center justify-center bg-muted">
                <div className="text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">{mapError}</p>
                </div>
              </div>
            ) : (
              <div
                ref={mapContainerRef}
                className="w-full h-[320px] rounded-lg overflow-hidden bg-muted cursor-crosshair"
                style={{ minHeight: '320px' }}
              />
            )}

            {/* Select from previous locations */}
            <div>
              <Label className="mb-2 block">{t('locations.selectFromPrevious')}</Label>
              <p className="text-xs text-muted-foreground mb-2">{t('locations.yourLocations')}</p>
              {userLocationsLoading ? (
                <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
              ) : userLocations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t('locations.noLocations') ?? "You don't have any locations yet. Click on the map above to create one."}
                </p>
              ) : (
                <ul className="space-y-2">
                  {userLocations.map((loc) => (
                    <li key={loc.id} className="flex items-center justify-between gap-2 rounded-md border p-3">
                      <div className="min-w-0">
                        <p className="font-medium truncate">{loc.name}</p>
                        {loc.explanation && (
                          <p className="text-xs text-muted-foreground truncate">{loc.explanation}</p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant={selectedLocationIds.has(loc.id) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleLocationInTour(loc.id)}
                      >
                        {selectedLocationIds.has(loc.id) ? t('tours.removePlace') : t('tours.addPlace')}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Create new location (when map clicked) */}
            {newLocLat != null && newLocLng != null && (
              <Card className="border-primary/50">
                <CardHeader>
                  <CardTitle className="text-base">{t('locations.createLocation')}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {t('locations.coordinates')}: {newLocLat.toFixed(6)}, {newLocLng.toFixed(6)}
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateNewLocation} className="space-y-3">
                    <div>
                      <Label>{t('locations.name')} *</Label>
                      <Input
                        value={newLocName}
                        onChange={(e) => setNewLocName(e.target.value)}
                        placeholder="e.g., Leadenhall Market"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>{t('locations.explanation')}</Label>
                      <textarea
                        value={newLocExplanation}
                        onChange={(e) => setNewLocExplanation(e.target.value)}
                        placeholder="e.g., Historical, Victorian indoor marketplace..."
                        rows={2}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={creatingLocation}>
                        {creatingLocation ? t('common.saving') : t('locations.createLocation')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNewLocLat(null);
                          setNewLocLng(null);
                          setNewLocName('');
                          setNewLocExplanation('');
                        }}
                      >
                        {t('common.back')}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {message && (
          <p className={`text-sm ${messageError ? 'text-destructive' : 'text-emerald-600'}`}>
            {message}
          </p>
        )}

        <div className="flex gap-4">
          <Button type="submit" size="lg" disabled={saving} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {saving ? t('common.saving') : t('tours.saveTour')}
          </Button>
          <Button type="button" onClick={() => navigate('/tour')} variant="outline" size="lg">
            {t('common.back')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTour;
