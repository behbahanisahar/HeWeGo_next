import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, Search, X, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUserLocation, getCityFromCoords } from '@/utils/location';
import { Badge } from '@/components/ui/badge';
import { getAllCities } from '@/api/cities/get';

export interface UserLocationWithCity {
  latitude: number;
  longitude: number;
  city?: string | null;
}

interface LocationFilterProps {
  onSearchChange: (searchQuery: string) => void;
  searchQuery: string;
  /** When true, show "Use my location" and city; only used on Locations Near You page (handled there). This component is search-only elsewhere. */
  showLocation?: boolean;
  onLocationChange?: (location: UserLocationWithCity | null) => void;
  userLocation?: UserLocationWithCity | null;
}

export const LocationFilter = ({
  onSearchChange,
  searchQuery,
  showLocation = false,
  onLocationChange,
  userLocation = null,
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
    if (!onLocationChange) return;
    setIsRequestingLocation(true);
    setLocationError(null);
    try {
      const location = await getUserLocation();
      if (location) {
        const city = await getCityFromCoords(location.latitude, location.longitude);
        const locationWithCity: UserLocationWithCity = { ...location, city: city ?? null };
        onLocationChange(locationWithCity);
        localStorage.setItem('userLocation', JSON.stringify(locationWithCity));
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
    onLocationChange?.(null);
    localStorage.removeItem('userLocation');
    setLocationError(null);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  // Load saved location on mount only when location section is shown
  useEffect(() => {
    if (!showLocation || !onLocationChange) return;
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation) as UserLocationWithCity;
        if (location?.latitude != null && location?.longitude != null) {
          if (location.city == null || location.city === '') {
            getCityFromCoords(location.latitude, location.longitude).then((city) => {
              onLocationChange({ ...location, city: city ?? null });
            });
          } else {
            onLocationChange(location);
          }
        }
      } catch (e) {
        localStorage.removeItem('userLocation');
      }
    }
  }, [showLocation, onLocationChange]);

  return (
    <Card className="p-4 md:p-5 mb-8 rounded-xl border shadow-sm">
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

        {/* Location Section: only on Locations Near You page (that page has its own UI; here we only show search) */}
        {showLocation && (
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
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span>
                    {userLocation.city ? (
                      <>
                        <span className="font-medium">{t('location.youAreIn')}</span>
                        <span className="ml-1">{userLocation.city}</span>
                      </>
                    ) : (
                      <>
                        {t('location.usingLocation')}
                        {userLocation.latitude != null && userLocation.longitude != null && (
                          <span className="opacity-80 font-normal ml-1">
                            ({userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)})
                          </span>
                        )}
                      </>
                    )}
                  </span>
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
        )}
      </div>
    </Card>
  );
};
