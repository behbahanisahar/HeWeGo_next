import ICity from "./city";
import { ITourPlace } from "./tourPlace";

export interface ITour{
    tour_id:number;
    tour_name:string;
}
export interface IAllTourItems{
    id: number;
    name: string;
    city: ICity;
    description: string | null;
    creator_id: number | null;
    status_id: number;
    average_rating: number | null;
    tags: string[];
    prices: number[];
    // Extended fields for multi-place tours
    places?: ITourPlace[];
    estimatedDuration?: number;
    isUserCreated?: boolean;
    createdBy?: {
        id: number;
        name: string;
        avatar?: string;
    };
    routePolyline?: Array<[number, number]>;
}
/** Response from GET /api/alltours?page=1&per_page=10 */
export interface IAllTour{
    total: number;
    pages: number;
    page: number;
    per_page: number;
    items: IAllTourItems[];
}

/** Location/place from GET /api/tours/:id (single tour) */
export interface ITourLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  explanation?: string | null;
  tags?: string[];
  average_rating?: number | null;
  /** Visit time in minutes (set by tour creator). API may return estimated_time or estimatedTime. */
  estimated_time?: number;
  estimatedTime?: number;
}

/** Response from GET /api/tours/:id (single tour with locations for map) */
export interface ITourDetailResponse {
  id: number;
  name: string;
  /** API may return city object and/or city_id */
  city?: ICity;
  city_id?: number;
  description: string | null;
  creator_id: number | null;
  status_id: number;
  average_rating: number | null;
  tags: string[];
  prices: number[];
  locations: ITourLocation[];
}