import ICity from "./city";

export interface ITourPlaceMedia {
  id?: number;
  type: 'image' | 'audio' | 'video';
  url: string;
  thumbnail?: string; // For video/audio preview
  description?: string;
}

export interface ITourPlace {
  id: number;
  name: string;
  description?: string; // From API location.explanation – shown when user expands the card
  latitude: number;
  longitude: number;
  address?: string;
  order: number; // Order in the tour sequence
  estimatedTime?: number; // Time in minutes to spend at this place
  media?: ITourPlaceMedia[]; // Images, audio, video for this place
  /** From API location – shown when user clicks/expands the location */
  tags?: string[];
  average_rating?: number | null;
}

export default interface ITourPlace;
