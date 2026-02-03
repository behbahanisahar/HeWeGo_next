import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/starRating';
import { MapPin, Navigation, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUserLocation } from '@/utils/location';
import { calculateDistance } from '@/utils/location';
import { getNearbyLocations, type INearbyLocation } from '@/api/nearbyLocations/post';
import { rateLocation } from '@/api/rating/location/post';
import { Context } from '@/context/AppContext';

const PRESET_TAGS = ['history', 'nature', 'food', 'culture', 'art'];
const MAX_DISTANCE_OPTIONS = [1, 5, 10, 25, 50];
/** Location is only used on this page; not shared with Nearby Tours or home */
const LOCATION_STORAGE_KEY = 'nearbyLocationsPageLocation';

const NearbyLocationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const appContext = useContext(Context);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locations, setLocations] = useState<INearbyLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState(5);
  const [error, setError] = useState<string | null>(null);
  const [ratingLocationId, setRatingLocationId] = useState<number | null>(null);

  const isAuthenticated = Boolean(appContext?.state.userInfo?.id);

  useEffect(() => {
    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (saved) {
      try {
        const loc = JSON.parse(saved);
        if (typeof loc?.latitude === 'number' && typeof loc?.longitude === 'number') {
          setUserCoords(loc);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // Fetch nearby locations when user coords change or filters change
  useEffect(() => {
    if (!userCoords) {
      setLocations([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getNearbyLocations({
      latitude: String(userCoords.latitude),
      longitude: String(userCoords.longitude),
      tags: selectedTags,
      max_distance: maxDistance,
    })
      .then((list) => {
        if (!cancelled) {
          // Optionally attach distance from user for display
          const withDistance = list.map((loc) => ({
            ...loc,
            distance: calculateDistance(
              userCoords.latitude,
              userCoords.longitude,
              loc.latitude,
              loc.longitude
            ),
          }));
          withDistance.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
          setLocations(withDistance);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(t('locations.nearbyError') ?? 'Failed to load nearby locations.');
          setLocations([]);
        }
        console.error('Nearby locations error:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userCoords, selectedTags, maxDistance, t]);

  const handleUseMyLocation = async () => {
    setRequestingLocation(true);
    setError(null);
    try {
      const coords = await getUserLocation();
      if (coords) {
        setUserCoords(coords);
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(coords));
      } else {
        setError(t('location.locationError') ?? "Unable to get your location. Please try again.");
      }
    } catch (e) {
      setError(t('location.locationError') ?? "Unable to get your location. Please try again.");
    } finally {
      setRequestingLocation(false);
    }
  };

  const handleClearLocation = () => {
    setUserCoords(null);
    setLocations([]);
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleRateLocation = async (locationId: number, rating: number) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/locations/nearby' } } });
      return;
    }
    setRatingLocationId(locationId);
    try {
      await rateLocation(locationId, rating);
    } catch (err) {
      console.error('Rate location failed:', err);
    } finally {
      setRatingLocationId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          {t('locations.nearbyTitle')}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t('locations.nearbySubtitle')}
        </p>
      </div>

      {/* Location & filters */}
      <Card className="mb-8">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {userCoords ? (
              <>
                <Badge variant="secondary" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {t('location.usingLocation')}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleClearLocation}>
                  {t('location.clear')}
                </Button>
              </>
            ) : (
              <Button onClick={handleUseMyLocation} disabled={requestingLocation}>
                <Navigation className="h-4 w-4 mr-2" />
                {requestingLocation ? t('location.gettingLocation') : t('location.useMyLocation')}
              </Button>
            )}
          </div>

          {userCoords && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground mr-2">
                  {t('locations.filterByTags')}
                </span>
                {PRESET_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {t('locations.maxDistance')}
                </span>
                <select
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {MAX_DISTANCE_OPTIONS.map((km) => (
                    <option key={km} value={km}>
                      {km} km
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {!userCoords ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              {t('locations.nearbyEnableLocation')}
            </p>
            <Button onClick={handleUseMyLocation} disabled={requestingLocation}>
              <Navigation className="h-4 w-4 mr-2" />
              {t('location.useMyLocation')}
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : locations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <Card key={loc.id} className="flex flex-col h-full">
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg mb-2">{loc.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                  {loc.explanation || t('locations.noDescription')}
                </p>
                {loc.distance != null && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {loc.distance.toFixed(1)} km {t('locations.away')}
                  </p>
                )}
                {loc.tags && loc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {loc.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t space-y-2">
                  <span className="text-xs text-muted-foreground">{t('tours.rateThisPlace')}</span>
                  {isAuthenticated ? (
                    <StarRating
                      value={loc.average_rating ?? undefined}
                      max={5}
                      onSubmit={(r) => handleRateLocation(loc.id, r)}
                      loading={ratingLocationId === loc.id}
                      size="sm"
                    />
                  ) : (
                    <p className="text-xs text-muted-foreground">{t('tours.signInToRate')}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {t('locations.nearbyNoResults')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NearbyLocationsPage;
