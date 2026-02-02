import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Star, MapPin, Users, DollarSign, Clock, Route } from 'lucide-react';
import { getTourById } from '@/api/tour/get';
import { getAllCities } from '@/api/cities/get';
import { IAllTourItems, ITourLocation } from '@/entities/tour';
import type ICity from '@/entities/city';
import type { ITourPlace } from '@/entities/tourPlace';
import { useTranslation } from 'react-i18next';
import { TourMap } from '@/components/map/tourMap';
import { TourMapMultiPlace } from '@/components/map/tourMapMultiPlace';
import { PlaceCard } from '@/components/tour/placeCard/placeCard';
import { estimateTourDuration, formatDuration } from '@/utils/aiEstimation';
import { getPriceDisplay, formatPriceDisplay } from '@/utils/tourPrice';
import homepage from "@/images/homepage.jpg";
import homepage2 from "@/images/homepage2.jpg";
import homepage3 from "@/images/homepage3.jpg";

const sampleImages = [homepage, homepage2, homepage3];

/** Map API locations to ITourPlace; keep explanation, tags, average_rating for expand-on-click UX */
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

const TourDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<IAllTourItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<ICity[]>([]);
  const [_currentImageIndex, _setCurrentImageIndex] = useState(0);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);

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
        setCities(list);
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
        if (places.length > 0) {
          setEstimatedDuration(estimateTourDuration(places));
        }
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded w-32" />
          <div className="aspect-video bg-muted rounded-lg" />
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-full" />
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl text-center">
        <p className="text-muted-foreground mb-4">{t('tours.tourNotFound')}</p>
        <Button onClick={() => navigate('/tour')}>{t('tours.backToTours')}</Button>
      </div>
    );
  }

  const imageIndex = parseInt(id || '0') % sampleImages.length;
  const tourImage = sampleImages[imageIndex];

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8 max-w-6xl">
        <Button variant="ghost" onClick={() => navigate('/tour')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('tours.backToTours')}
        </Button>
      </div>

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
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        {/* Content overlay */}
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-12 max-w-6xl">
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
              {tour.tags?.slice(0, 2).map((tag: string, index: number) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {tour.name || 'Unnamed Tour'}
            </h1>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">{t('tours.aboutThisTour')}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {tour.description || t('tours.noDescription')}
                </p>
              </CardContent>
            </Card>

            {tour.tags && tour.tags.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{t('tours.tagsAndCategories')}</h2>
                  <div className="flex flex-wrap gap-2">
                    {tour.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Map Section - Show multi-place map if places exist, otherwise single location */}
            {tour.places && tour.places.length > 0 ? (
              <TourMapMultiPlace
                places={tour.places}
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

            {/* Tour Places/Stops */}
            {tour.places && tour.places.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Route className="h-5 w-5 text-primary" />
                    <h2 className="text-2xl font-bold">
                      {t('tours.places')} ({tour.places.length} {tour.places.length === 1 ? t('tours.stop') : t('tours.stops')})
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {tour.places
                      .sort((a: { order: number }, b: { order: number }) => a.order - b.order)
                      .map((place: ITourPlace, index: number) => (
                        <PlaceCard key={place.id} place={place} index={index} />
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold">{t('tours.tourDetails')}</h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm">{t('tours.price')}</span>
                  </div>
                  <p className="text-2xl font-bold">
                    {formatPriceDisplay(getPriceDisplay(tour.prices), t)}
                  </p>
                </div>

                {(tour.city || cities.length > 0) && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{t('tours.location')}</span>
                    </div>
                    {cities.length > 0 ? (
                      <select
                        value={tour.city?.id ?? ''}
                        disabled
                        className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-default disabled:opacity-100"
                        aria-label={t('tours.location')}
                      >
                        <option value="">{t('tours.selectCity')}</option>
                        {cities.map((city) => (
                          <option key={city.id} value={city.id}>
                            {city.name}
                            {city.country ? `, ${city.country.trim()}` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="font-medium">{tour.city?.name ?? '—'}</p>
                    )}
                  </div>
                )}

                {tour.average_rating != null && tour.average_rating > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm">{t('tours.rating')}</span>
                    </div>
                    <p className="font-medium">{tour.average_rating.toFixed(1)} / 5.0</p>
                  </div>
                )}

                {(estimatedDuration !== null || tour.estimatedDuration) && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{t('tours.estimatedDuration')}</span>
                    </div>
                    <p className="font-medium">
                      {formatDuration(estimatedDuration || tour.estimatedDuration || 0)}
                    </p>
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

                <Button className="w-full mt-6" size="lg">
                  {t('tours.bookThisTour')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetail;
