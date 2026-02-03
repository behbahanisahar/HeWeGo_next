import { useEffect, useState, useRef, useCallback } from "react";
import { getAllTours } from "@/api/tour/get";
import { IAllTourItems } from "src/entities/tour";
import { AllTourCard } from "../allTourCard/allTourCard";
import { Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

  // Filter tours by search only (location only on Locations Near You page)
  useEffect(() => {
    if (allToursData.length === 0) {
      setFilteredTours([]);
      return;
    }
    const filtered = filterToursByLocation(allToursData, searchQuery, undefined, undefined);
    setFilteredTours(filtered);
    setPage(1);
    setTours([]);
  }, [allToursData, searchQuery]);

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
    <div className="space-y-8">
      <LocationFilter
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
      />

      {initialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(9)].map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-xl border shadow-sm">
              <Skeleton className="aspect-square w-full rounded-t-xl" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : fetchError ? (
        <Card className="rounded-2xl border shadow-sm overflow-hidden">
          <div className="text-center py-14 px-6">
            <p className="text-destructive font-medium mb-2">{t("tours.loadError")}</p>
            <p className="text-sm text-muted-foreground">{t("tours.loadErrorHint")}</p>
          </div>
        </Card>
      ) : tours.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {tours.map((tour: IAllTourItems) => (
              <AllTourCard key={tour.id} tour={tour} />
            ))}
          </div>
          <div ref={observerTarget} className="flex flex-col items-center justify-center py-10">
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-5 w-5 animate-spin shrink-0" />
                <span>{t("tours.loadingMore")}</span>
              </div>
            )}
            {!hasMore && tours.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">{t("tours.endOfList")}</p>
            )}
          </div>
        </>
      ) : (
        <Card className="rounded-2xl border shadow-sm overflow-hidden">
          <div className="text-center py-16 px-6">
            <p className="text-muted-foreground font-medium">{t("tours.noTours")}</p>
          </div>
        </Card>
      )}
    </div>
  );
};
