import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getUserLocation, filterToursByLocation } from '@/utils/location';
import { getAllTours } from '@/api/tour/get';
import { IAllTourItems } from '@/entities/tour';
import { getSampleTours } from '@/utils/sampleTours';
import { AllTourCard } from '@/components/tour/allTourCard/allTourCard';

const NearbyTours = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [tours, setTours] = useState<IAllTourItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingLocation, setRequestingLocation] = useState(false);

  useEffect(() => {
    // Try to load saved location first
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setUserLocation(location);
      } catch (e) {
        // Invalid saved location
      }
    }
  }, []);

  useEffect(() => {
    loadTours();
  }, [userLocation]);

  const loadTours = async () => {
    setLoading(true);
    try {
      const allTours = await getAllTours(1, 100)
        .then((data) => data.items || getSampleTours())
        .catch(() => getSampleTours());

      if (userLocation) {
        // Filter tours within 50km radius
        const nearbyTours = filterToursByLocation(
          allTours,
          undefined,
          userLocation,
          50 // 50km radius for "nearby"
        );
        setTours(nearbyTours);
      } else {
        // If no location, show all tours
        setTours(allTours);
      }
    } catch (error) {
      console.error('Error loading tours:', error);
      setTours(getSampleTours());
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = async () => {
    setRequestingLocation(true);
    try {
      const location = await getUserLocation();
      if (location) {
        setUserLocation(location);
        localStorage.setItem('userLocation', JSON.stringify(location));
      } else {
        // Show error toast
      }
    } catch (error) {
      console.error('Error getting location:', error);
    } finally {
      setRequestingLocation(false);
    }
  };

  const handleClearLocation = () => {
    setUserLocation(null);
    localStorage.removeItem('userLocation');
    loadTours();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">{t('tours.nearbyTours')}</h1>
        <p className="text-lg text-muted-foreground">
          Discover tours near your current location
        </p>
      </div>

      {/* Location Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {userLocation ? (
                <>
                  <Badge variant="secondary" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{t('location.usingLocation')}</span>
                  </Badge>
                  <Button variant="outline" size="sm" onClick={handleClearLocation}>
                    {t('location.clear')}
                  </Button>
                </>
              ) : (
                <Button onClick={handleGetLocation} disabled={requestingLocation}>
                  <Navigation className="h-4 w-4 mr-2" />
                  {requestingLocation ? t('location.gettingLocation') : t('location.useMyLocation')}
                </Button>
              )}
            </div>
            <Button variant="outline" onClick={() => navigate('/tour')}>
              <Search className="h-4 w-4 mr-2" />
              {t('home.browseAllTours')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tours Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : tours.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <AllTourCard key={tour.id} tour={tour} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">
              {userLocation
                ? 'No tours found near your location. Try expanding your search or browse all tours.'
                : 'Enable location access to see tours near you.'}
            </p>
            {!userLocation && (
              <Button onClick={handleGetLocation}>
                <Navigation className="h-4 w-4 mr-2" />
                {t('location.useMyLocation')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NearbyTours;
