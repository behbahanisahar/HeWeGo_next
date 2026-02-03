import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Filter tours by search only (location only on Locations Near You page)
  useEffect(() => {
    if (allTours.length === 0) return;
    const filtered = filterToursByLocation(allTours, searchQuery, undefined, undefined);
    setFeaturedTours(filtered.slice(0, 6));
  }, [allTours, searchQuery]);

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
      {/* Hero Section - travel-first, modern */}
      <section className="relative border-b overflow-hidden min-h-[75vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${homepage})` }}
        />
        {/* Neutral dark overlay - no color tint, keeps image natural */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        <div className="absolute inset-0 backdrop-blur-[3px]" aria-hidden />

        <div className="relative z-10 container mx-auto px-4 py-24 md:py-36 w-full">
          <div className="max-w-3xl mx-auto text-center space-y-7">
            {/* Badge - aligned icon + text */}
            <div className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-sm font-semibold shadow-xl">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <span>{t('home.discoverAmazingTours')}</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
              {t('home.exploreWorld')}{' '}
              <span className="text-primary">{t('home.hewego')}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>
            {/* Buttons - compact, visible in both modes, correct border */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button
                size="default"
                onClick={handleExploreClick}
                className="rounded-xl text-sm font-medium px-5 h-10 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary text-primary-foreground hover:bg-primary/90 border border-primary/80 inline-flex items-center justify-center gap-2"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Search className="h-4 w-4 shrink-0" />
                  <span>{t('home.exploreTours')}</span>
                </span>
              </Button>
              <Button
                size="default"
                variant="outline"
                onClick={() => navigate('/tour')}
                className="rounded-xl text-sm font-medium px-5 h-10 border border-white/60 bg-white/10 text-white hover:bg-white/15 hover:border-white/80 hover:text-white backdrop-blur-sm transition-all duration-200"
              >
                {t('home.viewAllTours')}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <LocationFilter
          onSearchChange={setSearchQuery}
          searchQuery={searchQuery}
        />

        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <TrendingUp className="h-5 w-5" />
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {searchQuery ? t('tours.subtitle') : t('home.featuredTours')}
              </h2>
            </div>
            <p className="text-muted-foreground text-sm md:text-base">
              {searchQuery ? t('tours.subtitle') : t('home.featuredToursSubtitle')}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild className="hidden md:inline-flex rounded-xl">
            <Link to="/tour">{t('common.viewAll')} →</Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
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

        {/* CTA Section - inviting for tourists */}
        <div className="text-center mt-16 p-10 md:p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
          <h3 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{t('home.readyToStart')}</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-base">
            {t('home.readyToStartSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleExploreClick} className="rounded-xl font-semibold">
              {t('home.exploreAllTours')}
            </Button>
            {!localStorage.getItem('access_token') && (
              <Button size="lg" variant="outline" onClick={() => navigate('/register')} className="rounded-xl font-semibold">
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
