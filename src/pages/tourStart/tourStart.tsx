import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Route } from 'lucide-react';
import { getTourById } from '@/api/tour/get';
import { IAllTourItems, ITourLocation } from '@/entities/tour';
import type ICity from '@/entities/city';
import type { ITourPlace } from '@/entities/tourPlace';
import { useTranslation } from 'react-i18next';
import { TourMapMultiPlace } from '@/components/map/tourMapMultiPlace';
import { PlaceCard } from '@/components/tour/placeCard/placeCard';
import { getUserLocation } from '@/utils/location';
import {
  optimizeRouteOrderFromUserLocation,
  optimizeRouteOrder,
  estimateTimeFromUserToFirstPlace,
  formatDuration,
} from '@/utils/aiEstimation';
import { useRealRouteTimes, type LegDisplayAllModes } from '@/hooks/useRealRouteTimes';
import { fetchRealRouteDurations, type RealLegResult } from '@/utils/openRouteService';
import { getAllCities } from '@/api/cities/get';

function mapLocationsToPlaces(locations: ITourLocation[]): ITourPlace[] {
  return (locations ?? []).map((loc, index) => ({
    id: loc.id,
    name: loc.name,
    latitude: loc.latitude,
    longitude: loc.longitude,
    description: loc.explanation ?? undefined,
    order: index,
    tags: loc.tags,
    average_rating: loc.average_rating,
  }));
}

const TourStart = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<IAllTourItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationChecked, setLocationChecked] = useState(false);
  const [realTimeToFirstStop, setRealTimeToFirstStop] = useState<number | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/tour');
      return;
    }

    const defaultCity: ICity = {
      id: 0,
      name: '',
      country: '',
      longitude: 0,
      latitude: 0,
    };

    Promise.all([getTourById(id), getAllCities()])
      .then(([data, citiesList]) => {
        const list = Array.isArray(citiesList) ? citiesList : [];
        const rawLocations = Array.isArray(data?.locations) ? data.locations : [];
        const places = mapLocationsToPlaces(rawLocations);
        const cityId = data?.city_id ?? data?.city?.id;
        const cityIdFromObj = data?.city?.id;
        const resolvedCity =
          (cityId != null && list.find((c) => c.id === Number(cityId))) ||
          (cityIdFromObj != null && list.find((c) => c.id === Number(cityIdFromObj))) ||
          data?.city ||
          defaultCity;
        const tourFromApi: IAllTourItems = {
          id: data?.id ?? Number(id) ?? 0,
          name: data?.name ?? '',
          city: resolvedCity && resolvedCity.id ? resolvedCity : defaultCity,
          description: data?.description ?? null,
          creator_id: data?.creator_id ?? null,
          status_id: data?.status_id ?? 0,
          average_rating: data?.average_rating ?? null,
          tags: Array.isArray(data?.tags) ? data.tags : [],
          prices: Array.isArray(data?.prices) ? data.prices : [],
          places: places.length > 0 ? places : undefined,
        };
        setTour(tourFromApi);
      })
      .catch((err) => {
        console.error('Error fetching tour:', err);
        setTour(null);
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (!tour?.places?.length || locationChecked) return;
    setLocationChecked(true);
    getUserLocation().then((loc) => {
      if (loc) setUserLocation(loc);
    });
  }, [tour?.places?.length, locationChecked]);

  const displayPlaces = useMemo(() => {
    const base = [...(tour?.places ?? [])].sort((a, b) => a.order - b.order);
    if (!base.length) return base;
    if (userLocation) {
      return optimizeRouteOrderFromUserLocation(base, userLocation.latitude, userLocation.longitude);
    }
    return optimizeRouteOrder(base);
  }, [tour?.places, userLocation]);

  const { legs: legEstimatesAllModes, totalsByMode } = useRealRouteTimes(displayPlaces);

  const legEstimates = useMemo(
    () =>
      legEstimatesAllModes.map((leg: LegDisplayAllModes) => ({
        ...leg,
        travelTimeMinutes: leg.travelTimeByMode.walk,
      })),
    [legEstimatesAllModes]
  );

  useEffect(() => {
    if (!userLocation || displayPlaces.length === 0) {
      setRealTimeToFirstStop(null);
      return;
    }
    const first = displayPlaces[0];
    fetchRealRouteDurations(
      [
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: first.latitude, longitude: first.longitude },
      ],
      'walk'
    ).then((result: RealLegResult | null) => {
      if (result?.legs[0]) setRealTimeToFirstStop(result.legs[0].durationMinutes);
      else setRealTimeToFirstStop(null);
    });
  }, [userLocation, displayPlaces]);

  const timeToFirstStop = useMemo(() => {
    if (!userLocation || displayPlaces.length === 0) return null;
    if (realTimeToFirstStop != null) return realTimeToFirstStop;
    return estimateTimeFromUserToFirstPlace(
      userLocation.latitude,
      userLocation.longitude,
      displayPlaces[0],
      'walk'
    );
  }, [userLocation, displayPlaces, realTimeToFirstStop]);

  const totalTourDuration = totalsByMode.walk;

  if (loading || !tour) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-10 w-48 rounded-xl mb-6" />
        <Skeleton className="h-[400px] w-full rounded-xl mb-6" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!tour.places?.length) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-muted-foreground mb-4">{t('tours.tourNotFound')}</p>
        <Button asChild variant="outline" className="rounded-xl">
          <Link to={`/tour/${id}`}>{t('tours.backToTours')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full shrink-0" asChild>
            <Link to={`/tour/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('tours.startTourTitle')}</h1>
            <p className="text-sm text-muted-foreground">{t('tours.startTourSubtitle')}</p>
          </div>
        </div>

        <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
          <div className="px-4 py-3 border-b bg-muted/30 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium">
              {userLocation
                ? t('tours.locationAllowed')
                : t('tours.locationDenied')}
            </span>
          </div>
          <TourMapMultiPlace
            places={displayPlaces}
            tourName={tour.name}
            cityName={tour.city?.name}
            embed
            userLocation={
              userLocation
                ? {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    label: 'You are here',
                  }
                : null
              }
          />
        </div>

        {(timeToFirstStop !== null || totalTourDuration > 0) && (
          <Card className="rounded-xl border shadow-sm">
            <CardContent className="p-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {timeToFirstStop !== null && (
                <span className="font-medium">
                  {t('tours.timeToFirstStop', { minutes: timeToFirstStop })}
                </span>
              )}
              {totalTourDuration > 0 && (
                <span className="text-muted-foreground">
                  {t('tours.thenTourDuration', { duration: formatDuration(totalTourDuration) })}
                </span>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="rounded-xl border shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Route className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                {t('tours.places')} ({displayPlaces.length})
              </h2>
            </div>
            <div className="relative pl-8">
              <div
                className="absolute left-[11px] top-6 bottom-6 w-px bg-border"
                aria-hidden
              />
              <div className="space-y-4">
                {displayPlaces.map((place: ITourPlace, index: number) => (
                  <div key={place.id} className="relative flex flex-col gap-2">
                    <div className="relative flex gap-4">
                      <div className="absolute left-[-1.6rem] top-5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <PlaceCard
                          place={place}
                          index={index}
                          showStepBadge={false}
                          showVisitByCreator
                        />
                      </div>
                    </div>
                    {place.estimatedTime != null && place.estimatedTime > 0 && (
                      <p className="pl-4 text-sm text-muted-foreground mt-2">
                        {t('tours.visitTimeByCreator', { minutes: place.estimatedTime })}
                      </p>
                    )}
                    {index < legEstimates.length && (
                      <div className="flex items-center gap-2 pl-4 text-sm text-muted-foreground">
                        <span className="h-px flex-1 max-w-[2rem] bg-border" aria-hidden />
                        <span>{t('tours.minToNextStop', { minutes: legEstimates[index].travelTimeMinutes })}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TourStart;
