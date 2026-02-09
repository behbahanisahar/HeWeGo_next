import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Star, MapPin, Users, DollarSign, Clock, Route, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTourById } from '@/api/tour/get';
import { Context } from '@/context/AppContext';
import { addFavourite } from '@/api/favourites/post';
import { deleteFavourite } from '@/api/favourites/delete';
import type { IFavouriteItem } from '@/api/favourites/get';
import { getAllCities } from '@/api/cities/get';
import { IAllTourItems, ITourLocation } from '@/entities/tour';
import type ICity from '@/entities/city';
import type { ITourPlace } from '@/entities/tourPlace';
import { useTranslation } from 'react-i18next';
import { TourMap } from '@/components/map/tourMap';
import { TourMapMultiPlace } from '@/components/map/tourMapMultiPlace';
import { PlaceCard } from '@/components/tour/placeCard/placeCard';
import { StarRating } from '@/components/ui/starRating';
import { rateTour } from '@/api/rating/tour/post';
import { rateLocation } from '@/api/rating/location/post';
import { formatDuration } from '@/utils/aiEstimation';
import { useRealRouteTimes } from '@/hooks/useRealRouteTimes';
import { getPriceDisplay, formatPriceDisplay } from '@/utils/tourPrice';
import homepage from "@/images/homepage.jpg";
import homepage2 from "@/images/homepage2.jpg";
import homepage3 from "@/images/homepage3.jpg";

const sampleImages = [homepage, homepage2, homepage3];

/** Map API locations to ITourPlace; keep explanation, tags, average_rating, visit time from creator */
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
    estimatedTime: loc.estimated_time ?? loc.estimatedTime,
  }));
}

const TourDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const appContext = useContext(Context);
  const [tour, setTour] = useState<IAllTourItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [_currentImageIndex, _setCurrentImageIndex] = useState(0);
  const [favouriteLoading, setFavouriteLoading] = useState(false);
  const [tourRatingLoading, setTourRatingLoading] = useState(false);
  const [ratingLocationId, setRatingLocationId] = useState<number | null>(null);

  const displayPlaces = useMemo(
    () => [...(tour?.places ?? [])].sort((a, b) => a.order - b.order),
    [tour?.places]
  );

  const { legs: legEstimatesAllModes, totalsByMode, loading: routeTimesLoading, hasRealTimesAvailable } = useRealRouteTimes(displayPlaces);

  const isAuthenticated = Boolean(appContext?.state.userInfo?.id);
  const favorites = (appContext?.state.favorites ?? []) as IFavouriteItem[];
  const isFavourite = id != null && favorites.some((f) => Number(f.id) === Number(id));
  const bookedTours = appContext?.state.userInfo?.booked_tours ?? [];
  const hasBookedThisTour = tour != null && bookedTours.some((bt) => Number(bt.tour_id) === Number(tour.id));

  const handleFavouriteToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/tour/${id}` } } });
      return;
    }
    if (!tour?.id || favouriteLoading) return;
    setFavouriteLoading(true);
    try {
      if (isFavourite) {
        await deleteFavourite(tour.id);
      } else {
        await addFavourite(tour.id);
      }
      await appContext?.actions.refreshFavorites();
    } catch (err) {
      console.error('Favourite update failed:', err);
    } finally {
      setFavouriteLoading(false);
    }
  };

  const handleRateTour = async (stars: number) => {
    if (!tour?.id || !isAuthenticated) {
      if (!isAuthenticated) navigate('/login', { state: { from: { pathname: `/tour/${id}` } } });
      return;
    }
    setTourRatingLoading(true);
    try {
      // API expects 1–10 for tour; we use 5 stars so send stars * 2
      await rateTour(tour.id, Math.min(10, stars * 2), { tour_id: tour.id });
    } catch (err) {
      console.error('Rate tour failed:', err);
    } finally {
      setTourRatingLoading(false);
    }
  };

  const handleRateLocation = async (locationId: number, rating: number) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/tour/${id}` } } });
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

    // Fetch tour and cities in parallel; resolve tour city from GET /api/all_cities
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
        console.error("Error fetching tour:", err);
        setTour(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Hero skeleton */}
        <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden bg-muted">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <div className="absolute bottom-12 left-4 right-4 max-w-6xl mx-auto space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-14 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
            <Skeleton className="h-12 w-3/4 max-w-md" />
          </div>
        </div>
        {/* Content skeleton */}
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-7 w-48 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-7 w-32 rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="rounded-2xl border shadow-sm max-w-md w-full overflow-hidden">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-6">{t('tours.tourNotFound')}</p>
            <Button onClick={() => navigate('/tour')} className="rounded-xl">
              {t('tours.backToTours')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const imageIndex = parseInt(id || '0') % sampleImages.length;
  const tourImage = sampleImages[imageIndex];

  return (
    <div className="min-h-screen">
      {/* Hero Image Section */}
      <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
        {/* Blurred background */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110 blur-2xl opacity-30"
          style={{ backgroundImage: `url(${tourImage})` }}
        />
        {/* Main image */}
        <img
          src={tourImage}
          alt={tour.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay - matches home hero for consistency */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back button - top-left over hero */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 rounded-full px-4 h-10 text-white bg-black/50 hover:bg-black/70 hover:text-white border-0 shadow-lg font-medium leading-none flex items-center justify-center"
            onClick={() => navigate('/tour')}
          >
            <span className="inline-flex items-center justify-center leading-[0]">
              <ArrowLeft className="h-4 w-4 shrink-0 -translate-y-0.5" />
            </span>
            <span className="leading-none">{t('tours.backToTours')}</span>
          </Button>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12 max-w-6xl">
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center p-0 text-white bg-black/40 hover:bg-black/60 hover:text-white border-0 shadow-md"
              onClick={handleFavouriteToggle}
              disabled={favouriteLoading}
              title={isFavourite ? t('tours.removeFromFavourites') : t('tours.addToFavourites')}
              aria-label={isFavourite ? t('tours.removeFromFavourites') : t('tours.addToFavourites')}
            >
              <Heart className={`h-5 w-5 shrink-0 ${isFavourite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
          <div className="w-full">
            <div className="flex flex-wrap gap-2 mb-4">
              {tour.city && (
                <Badge variant="secondary" className="text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
                  {tour.city.name}
                </Badge>
              )}
              {tour.average_rating != null && tour.average_rating > 0 && (
                <Badge variant="secondary" className="text-sm">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                  {tour.average_rating.toFixed(1)}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {tour.name || 'Unnamed Tour'}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-10 md:py-14 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-xl border shadow-sm overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl md:text-2xl font-bold mb-4 tracking-tight">{t('tours.aboutThisTour')}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {tour.description || t('tours.noDescription')}
                </p>
                {tour.tags && tour.tags.length > 0 && (
                  <div className="mt-5 pt-5 border-t">
                    <span className="text-sm font-medium text-muted-foreground mb-2 block">{t('tours.tagsAndCategories')}</span>
                    <div className="flex flex-wrap gap-2">
                      {tour.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-sm py-1 px-3 rounded-lg">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Section - Show multi-place map if places exist, otherwise single location */}
            {displayPlaces.length > 0 ? (
              <TourMapMultiPlace
                places={displayPlaces}
                tourName={tour.name}
                cityName={tour.city?.name}
              />
            ) : tour.city && tour.city.latitude && tour.city.longitude ? (
              <TourMap
                latitude={tour.city.latitude}
                longitude={tour.city.longitude}
                cityName={tour.city.name}
                tourName={tour.name}
              />
            ) : null}

            {/* Tour Places/Stops – timeline layout */}
            {displayPlaces.length > 0 && (
              <Card className="rounded-xl border shadow-sm overflow-hidden">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Route className="h-5 w-5" />
                    </span>
                    <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                      {t('tours.places')} ({displayPlaces.length} {displayPlaces.length === 1 ? t('tours.stop') : t('tours.stops')})
                    </h2>
                  </div>
                  <div className="relative pl-8 sm:pl-10">
                    <div
                      className="absolute left-[11px] sm:left-[15px] top-6 bottom-6 w-px bg-border"
                      aria-hidden
                    />
                    <div className="space-y-4">
                      {displayPlaces.map((place: ITourPlace, index: number) => (
                        <div key={place.id} className="relative flex flex-col gap-2">
                          <div className="relative flex gap-4">
                            <div className="absolute left-[-1.6rem] sm:left-[-2rem] top-5 flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-semibold text-primary">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <PlaceCard
                                place={place}
                                index={index}
                                onRateLocation={handleRateLocation}
                                isAuthenticated={isAuthenticated}
                                rateLoading={ratingLocationId === place.id}
                                showStepBadge={false}
                                showVisitByCreator
                              />
                              {place.estimatedTime != null && place.estimatedTime > 0 && (
                                <p className="pl-4 sm:pl-6 text-sm text-muted-foreground mt-2">
                                  {t('tours.visitTimeByCreator', { minutes: place.estimatedTime })}
                                </p>
                              )}
                            </div>
                          </div>
                          {index < legEstimatesAllModes.length && (
                            <div className="flex items-center gap-2 pl-4 sm:pl-6 text-sm text-muted-foreground">
                              <span className="h-px flex-1 max-w-[2rem] bg-border" aria-hidden />
                              <span>
                                {t('tours.legTravelTimes', {
                                  walk: legEstimatesAllModes[index].travelTimeByMode.walk,
                                  car: legEstimatesAllModes[index].travelTimeByMode.drive,
                                  transit: legEstimatesAllModes[index].travelTimeByMode.transit,
                                  bike: legEstimatesAllModes[index].travelTimeByMode.bicycle,
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24 rounded-xl border shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-lg font-bold tracking-tight">{t('tours.tourDetails')}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">{t('tours.price')}</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatPriceDisplay(getPriceDisplay(tour.prices), t)}
                  </p>
                </div>

                {(tour.city || (tour.average_rating != null && tour.average_rating > 0)) && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 border-t text-sm text-muted-foreground">
                    {tour.city && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {tour.city.name}
                        {tour.city.country ? `, ${tour.city.country.trim()}` : ''}
                      </span>
                    )}
                    {tour.city && tour.average_rating != null && tour.average_rating > 0 && <span aria-hidden>·</span>}
                    {tour.average_rating != null && tour.average_rating > 0 && (
                      <span className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500 shrink-0" />
                        {tour.average_rating.toFixed(1)} / 5
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-2 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">{t('tours.rateThisTour')}</span>
                  {isAuthenticated ? (
                    <div className="flex items-center gap-2">
                      <StarRating
                        value={tour.average_rating ?? undefined}
                        max={5}
                        onSubmit={handleRateTour}
                        loading={tourRatingLoading}
                        size="md"
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{t('tours.signInToRate')}</p>
                  )}
                </div>

                {(displayPlaces.length > 0 || tour.estimatedDuration) && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{t('tours.estimatedTotalByMode')}</span>
                      {routeTimesLoading && (
                        <span className="text-xs text-muted-foreground/80">({t('tours.loadingTravelTimes')})</span>
                      )}
                      {hasRealTimesAvailable && !routeTimesLoading && (
                        <span className="text-xs text-primary" title={t('tours.realTravelTimes')}>•</span>
                      )}
                    </div>
                    {displayPlaces.length > 0 ? (
                      <ul className="text-sm space-y-1 font-medium">
                        <li>{t('tours.travelByWalk')}: {formatDuration(totalsByMode.walk)}</li>
                        <li>{t('tours.travelByDrive')}: {formatDuration(totalsByMode.drive)}</li>
                        <li>{t('tours.travelByTransit')}: {formatDuration(totalsByMode.transit)}</li>
                        <li>{t('tours.travelByBicycle')}: {formatDuration(totalsByMode.bicycle)}</li>
                      </ul>
                    ) : (
                      <p className="font-medium">{formatDuration(tour.estimatedDuration ?? 0)}</p>
                    )}
                  </div>
                )}

                {tour.isUserCreated && tour.createdBy && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">{t('tours.userCreated')}</span>
                    </div>
                    <p className="font-medium">{tour.createdBy.name}</p>
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-6">
                  {hasBookedThisTour ? (
                    <Button className="w-full rounded-xl" size="lg" asChild>
                      <Link to={`/tour/${tour.id}/start`}>{t('tours.startThisTour')}</Link>
                    </Button>
                  ) : (
                    <Button className="w-full rounded-xl" size="lg">
                      {t('tours.bookThisTour')}
                    </Button>
                  )}
                  {hasBookedThisTour && (
                    <p className="text-center text-xs text-muted-foreground">
                      {t('tours.youBookedThisTour')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
