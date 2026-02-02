import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllTours } from "@/api/tour/get";
import { IAllTourItems } from "@/entities/tour";
import { Search, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FeaturedTourCard } from "@/components/tour/featuredTourCard/featuredTourCard";
import { useTranslation } from 'react-i18next';
import { LocationFilter } from '@/components/location/locationFilter';
import { filterToursByLocation } from '@/utils/location';
import homepage from "@/images/homepage.jpg";

const HomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [featuredTours, setFeaturedTours] = useState<IAllTourItems[]>([]);
  const [allTours, setAllTours] = useState<IAllTourItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Fetch all tours from API only (no static/sample data)
  useEffect(() => {
    getAllTours(1, 100)
      .then((data) => {
        setAllTours(data?.items ?? []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching tours:", error);
        setAllTours([]);
        setLoading(false);
      });
  }, []);

  // Filter tours based on location and search
  useEffect(() => {
    if (allTours.length === 0) return;

    // If location is enabled and no search, filter by location (500km radius)
    // If search exists, show all matching tours regardless of location
    const shouldFilterByLocation = userLocation && !searchQuery;
    
    let filtered = filterToursByLocation(
      allTours,
      searchQuery,
      userLocation ?? undefined,
      shouldFilterByLocation ? 500 : undefined // Only apply distance filter if location enabled and no search
    );

    // Limit to 6 for featured tours on homepage
    setFeaturedTours(filtered.slice(0, 6));
  }, [allTours, searchQuery, userLocation]);

  const handleExploreClick = () => {
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) {
      navigate('/login');
    } else {
      navigate('/tour');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Blurred City Background */}
      <section className="relative border-b overflow-hidden min-h-[70vh] flex items-center">
        {/* Blurry city background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${homepage})` }}
        />
        {/* Blur overlay - lighter blur */}
        <div className="absolute inset-0 bg-background/30 backdrop-blur-sm" />
        {/* Additional gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/30 to-background/70" />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32 w-full">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-sm text-primary text-sm font-medium mb-4 border border-primary/20">
              <Sparkles className="h-4 w-4" />
              <span>{t('home.discoverAmazingTours')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              {t('home.exploreWorld')}{' '}
              <span className="text-primary">{t('home.hewego')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 max-w-2xl mx-auto drop-shadow-sm">
              {t('home.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={handleExploreClick} className="text-lg px-8 shadow-lg">
                <Search className="mr-2 h-5 w-5" />
                {t('home.exploreTours')}
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/tour')} className="text-lg px-8 bg-background/80 backdrop-blur-sm border-2">
                {t('home.viewAllTours')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="container mx-auto px-4 py-16">
        {/* Location Filter */}
        <LocationFilter
          onLocationChange={setUserLocation}
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
          userLocation={userLocation}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-3xl font-bold">
                {userLocation && !searchQuery ? t('location.nearbyTours') : t('home.featuredTours')}
              </h2>
            </div>
            <p className="text-muted-foreground">
              {userLocation && !searchQuery
                ? t('home.featuredToursSubtitle')
                : searchQuery
                ? t('tours.subtitle')
                : t('home.featuredToursSubtitle')
              }
            </p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link to="/tour">{t('common.viewAll')} →</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : featuredTours.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredTours.map((tour, index) => (
              <FeaturedTourCard key={tour.id} tour={tour} index={index} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">{t('tours.noTours')}</p>
        )}

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 rounded-lg bg-muted/50">
          <h3 className="text-2xl font-bold mb-2">{t('home.readyToStart')}</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t('home.readyToStartSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleExploreClick}>
              {t('home.exploreAllTours')}
            </Button>
            {!localStorage.getItem('access_token') && (
              <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
                {t('common.createAccount')}
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
