import { useEffect, useState, useRef, useCallback } from "react";
import { getAllTours } from "@/api/tour/get";
import { IAllTourItems } from "src/entities/tour";
import { AllTourCard } from "../allTourCard/allTourCard";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { LocationFilter } from '@/components/location/locationFilter';
import { filterToursByLocation } from '@/utils/location';

export const AllTours = () => {
  const { t } = useTranslation();
  const [tours, setTours] = useState<IAllTourItems[]>([]);
  const [allToursData, setAllToursData] = useState<IAllTourItems[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  const observerTarget = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [filteredTours, setFilteredTours] = useState<IAllTourItems[]>([]);

  // Load all tours from API only (no static/sample fallback).
  const initialFetchRef = useRef<Promise<IAllTourItems[]> | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (!initialFetchRef.current) {
      initialFetchRef.current = getAllTours(1, 100).then((data) => data?.items ?? []);
    }
    initialFetchRef.current
      .then((items) => {
        if (!cancelled) {
          setAllToursData(items);
          setFetchError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error fetching tours:", error);
          setAllToursData([]);
          setFetchError("error");
        }
      })
      .finally(() => {
        if (!cancelled) setInitialLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter tours based on location and search - this creates the filtered list
  useEffect(() => {
    if (allToursData.length === 0) {
      setFilteredTours([]);
      return;
    }

    // If location is enabled and no search, filter by location (500km radius)
    // If search exists, show all matching tours regardless of location
    const shouldFilterByLocation = userLocation && !searchQuery;

    const filtered = filterToursByLocation(
      allToursData,
      searchQuery,
      userLocation ?? undefined,
      shouldFilterByLocation ? 500 : undefined // Only apply distance filter if location enabled and no search
    );

    setFilteredTours(filtered);
    // Reset to page 1 when filters change
    setPage(1);
    setTours([]);
  }, [allToursData, searchQuery, userLocation]);

  // Load tours for current page from filtered list
  useEffect(() => {
    if (filteredTours.length === 0) {
      setTours([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const newTours = filteredTours.slice(startIndex, endIndex);
      
      if (page === 1) {
        setTours(newTours);
      } else {
        setTours(prev => [...prev, ...newTours]);
      }
      
      setHasMore(endIndex < filteredTours.length);
      setLoading(false);
    }, 300);
  }, [filteredTours, page, itemsPerPage]);

  const loadTours = useCallback(async (pageNum: number, _append: boolean = false) => {
    if (loading) return;
    setPage(pageNum);
  }, [loading]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          loadTours(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page, loadTours]);

  return (
    <div className="space-y-6">
      <LocationFilter
        onLocationChange={setUserLocation}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        userLocation={userLocation}
      />

      {initialLoading ? (
        <div className="flex justify-center py-16">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>{t("tours.loading")}</span>
          </div>
        </div>
      ) : fetchError ? (
        <div className="text-center py-12">
          <p className="text-destructive mb-2">{t("tours.loadError")}</p>
          <p className="text-sm text-muted-foreground">{t("tours.loadErrorHint")}</p>
        </div>
      ) : tours.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour: IAllTourItems) => (
              <AllTourCard key={tour.id} tour={tour} />
            ))}
          </div>
          <div ref={observerTarget} className="flex justify-center py-8">
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{t("tours.loadingMore")}</span>
              </div>
            )}
            {!hasMore && tours.length > 0 && (
              <p className="text-muted-foreground text-center">{t("tours.endOfList")}</p>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("tours.noTours")}</p>
        </div>
      )}
    </div>
  );
};
