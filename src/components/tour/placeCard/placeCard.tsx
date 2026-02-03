import { useState } from 'react';
import { ITourPlace, ITourPlaceMedia } from '@/entities/tourPlace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/starRating';
import { MapPin, Clock, ChevronDown, ChevronUp, Music, Video, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PlaceCardProps {
  place: ITourPlace;
  index: number;
  /** When provided and user is authenticated, show "Rate this place" */
  onRateLocation?: (locationId: number, rating: number) => void | Promise<void>;
  isAuthenticated?: boolean;
  rateLoading?: boolean;
  /** Set false when parent shows step number (e.g. timeline) to avoid duplicate */
  showStepBadge?: boolean;
}

export const PlaceCard = ({ place, index, onRateLocation, isAuthenticated, rateLoading, showStepBadge = true }: PlaceCardProps) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const hasDetails = place.description || (place.tags && place.tags.length > 0) || (place.average_rating != null && place.average_rating > 0) || Boolean(onRateLocation && isAuthenticated);

  return (
    <Card className="rounded-xl border shadow-sm overflow-hidden">
      <CardHeader
        className="cursor-pointer select-none hover:bg-muted/50 transition-colors rounded-t-xl"
        onClick={() => hasDetails && setExpanded((e) => !e)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {showStepBadge && (
                <Badge variant="outline" className="font-mono">
                  {index + 1}
                </Badge>
              )}
              <CardTitle className="text-lg">{place.name}</CardTitle>
              {hasDetails && (
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                  <span>{expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
                </Button>
              )}
            </div>
            {place.address && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span>{place.address}</span>
              </div>
            )}
          </div>
          {place.estimatedTime && (
            <Badge variant="secondary" className="flex items-center gap-1 shrink-0">
              <Clock className="h-3 w-3" />
              <span>{place.estimatedTime} min</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      {expanded && hasDetails && (
        <CardContent className="pt-0 space-y-4 border-t">
          {place.description && (
            <p className="text-sm text-muted-foreground pt-4">{place.description}</p>
          )}
          {place.tags && place.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag: string, i: number) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {place.average_rating != null && place.average_rating > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span>{place.average_rating.toFixed(1)}</span>
            </div>
          )}
          {onRateLocation && (
            <div className="space-y-2 pt-2 border-t">
              <span className="text-xs text-muted-foreground">{t('tours.rateThisPlace')}</span>
              {isAuthenticated ? (
                <StarRating
                  value={place.average_rating ?? undefined}
                  max={5}
                  onSubmit={(r) => onRateLocation(place.id, r)}
                  loading={rateLoading}
                  size="sm"
                />
              ) : (
                <p className="text-xs text-muted-foreground">{t('tours.signInToRate')}</p>
              )}
            </div>
          )}
        </CardContent>
      )}
      {place.media && place.media.length > 0 && (expanded || !hasDetails) && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>{t('tours.media')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {place.media.map((media: ITourPlaceMedia, mediaIndex: number) => (
                <div
                  key={mediaIndex}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer"
                >
                  {media.type === 'image' && (
                    <img
                      src={media.url}
                      alt={media.description || place.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  )}
                  {media.type === 'audio' && (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Music className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  {media.type === 'video' && (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    {media.type === 'audio' && (
                      <Music className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                    )}
                    {media.type === 'video' && (
                      <Video className="h-6 w-6 text-white opacity-0 group-hover:opacity-100" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
