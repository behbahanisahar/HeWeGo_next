import { axiosInstance } from '../axiosInstance';
import { IAllTour, IAllTourItems, ITourDetailResponse } from '@/entities/tour';

/** Ensure each tour has a numeric id (API may return id as string or use tour_id) */
function normalizeTourItems(items: unknown[]): IAllTourItems[] {
  return (items ?? []).map((item: any) => {
    const rawId = item?.id ?? item?.tour_id;
    const id = typeof rawId === 'number' ? rawId : Number(rawId);
    return { ...item, id: Number.isNaN(id) ? 0 : id } as IAllTourItems;
  });
}

/**
 * GET https://hewego.azurewebsites.net/api/alltours?page=1&per_page=10
 * Returns paginated list of tours with total, pages, page, per_page, items.
 * Handles both direct { items } and wrapped { data: { items } } response shapes.
 */
export async function getAllTours(page: number, per_page: number): Promise<IAllTour> {
  const response = await axiosInstance.get<IAllTour & { data?: IAllTour }>(
    `/api/alltours?page=${page}&per_page=${per_page}`
  );
  const data = response.data;
  const rawItems = Array.isArray(data?.items)
    ? data.items
    : Array.isArray(data?.data?.items)
      ? data?.data?.items ?? []
      : [];
  const items = normalizeTourItems(rawItems);
  return {
    total: data?.total ?? data?.data?.total ?? 0,
    pages: data?.pages ?? data?.data?.pages ?? 0,
    page: data?.page ?? data?.data?.page ?? 1,
    per_page: data?.per_page ?? data?.data?.per_page ?? 10,
    items,
  };
}

/**
 * GET https://hewego.azurewebsites.net/api/tours/:id
 * Returns single tour with city and locations (places to show on map).
 * Handles both direct response and wrapped { data: tour } or { tour: tour }.
 */
export async function getTourById(id: number | string): Promise<ITourDetailResponse> {
  const response = await axiosInstance.get(`/api/tours/${id}`);
  const body = response.data as any;
  const tour =
    body?.data != null ? body.data : body?.tour != null ? body.tour : body;
  if (!tour || typeof tour !== 'object') {
    throw new Error('Invalid tour response');
  }
  return tour as ITourDetailResponse;
}
  
