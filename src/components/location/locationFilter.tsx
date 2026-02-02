import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Search, X, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUserLocation } from '@/utils/location';
import { Badge } from '@/components/ui/badge';
import { getAllCities } from '@/api/cities/get';

interface LocationFilterProps {
  onLocationChange: (location: { latitude: number; longitude: number } | null) => void;
  onSearchChange: (searchQuery: string) => void;
  searchQuery: string;
  userLocation: { latitude: number; longitude: number } | null;
}

export const LocationFilter = ({
  onLocationChange,
  onSearchChange,
  searchQuery,
  userLocation,
}: LocationFilterProps) => {
  const { t } = useTranslation();
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cityNames, setCityNames] = useState<string[]>([]);

  // Load cities from API for search suggestions (once on mount)
  useEffect(() => {
    getAllCities()
      .then((cities) => setCityNames(cities.map((c) => c.name)))
      .catch(() => setCityNames([]));
  }, []);

  const handleGetLocation = async () => {
    setIsRequestingLocation(true);
    setLocationError(null);

    try {
      const location = await getUserLocation();
      if (location) {
        onLocationChange(location);
        // Store in localStorage for persistence
        localStorage.setItem('userLocation', JSON.stringify(location));
      } else {
        setLocationError(t('location.locationDenied'));
      }
    } catch (error) {
      setLocationError(t('location.locationError'));
    } finally {
      setIsRequestingLocation(false);
    }
  };


  const handleClearLocation = () => {
    onLocationChange(null);
    localStorage.removeItem('userLocation');
    setLocationError(null);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  // Load saved location on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        onLocationChange(location);
      } catch (e) {
        // Invalid saved location
        localStorage.removeItem('userLocation');
      }
    }
  }, [onLocationChange]);

  return (
    <Card className="p-4 mb-6">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('location.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-10"
            list="city-suggestions"
          />
          {cityNames.length > 0 && (
            <datalist id="city-suggestions">
              {cityNames.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          )}
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Location Section */}
        <div className="flex items-center gap-3 flex-wrap">
          {!userLocation ? (
            <Button
              variant="outline"
              onClick={handleGetLocation}
              disabled={isRequestingLocation}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              {isRequestingLocation ? t('location.gettingLocation') : t('location.useMyLocation')}
            </Button>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <Badge variant="secondary" className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                <span>{t('location.usingLocation')}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearLocation}
                className="h-7"
              >
                <X className="h-3 w-3 mr-1" />
                {t('location.clear')}
              </Button>
            </div>
          )}

          {locationError && (
            <p className="text-sm text-destructive">{locationError}</p>
          )}
        </div>
      </div>
    </Card>
  );
};
