import { IAllTourItems } from "@/entities/tour";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import homepage from "@/images/homepage.jpg";
import homepage2 from "@/images/homepage2.jpg";
import homepage3 from "@/images/homepage3.jpg";

interface FeaturedTourCardProps {
  tour: IAllTourItems & { distance?: number };
  index: number;
}

const sampleImages = [homepage, homepage2, homepage3];

export const FeaturedTourCard = ({ tour, index }: FeaturedTourCardProps) => {
  const { t } = useTranslation();
  const imageIndex = index % sampleImages.length;
  const tourImage = sampleImages[imageIndex];

  return (
    <Link to={`/tour/${tour.id}`} className="block h-full">
      <Card className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
        <div className="relative aspect-[4/3] overflow-hidden">
          {/* Main image - ensure it's on top */}
          <img
            src={tourImage}
            alt={tour.name || "Tour image"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            style={{ display: 'block' }}
          />
          {/* Gradient overlay for text readability - lighter so image shows through */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          
          {/* Rating Badge */}
          {tour.average_rating > 0 && (
            <div className="absolute top-3 left-3 z-30">
              <Badge className="bg-background/95 backdrop-blur-sm shadow-lg">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1" />
                <span className="text-xs font-semibold">{tour.average_rating.toFixed(1)}</span>
              </Badge>
            </div>
          )}
          
          {/* Price Badge - show for all tours (array: empty = Free, one = $X, multiple = From $X) */}
          <div className="absolute top-3 right-3 z-30">
            <Badge variant="secondary" className="bg-background/95 backdrop-blur-sm shadow-lg">
              <span className="text-xs font-semibold">
                {(() => {
                  const price = (() => {
                    const valid = Array.isArray(tour.prices) ? tour.prices.filter((n: number) => typeof n === 'number' && !Number.isNaN(n)) : [];
                    if (valid.length === 0) return null;
                    const min = Math.min(...valid);
                    return valid.length > 1 ? `${t('tours.priceFrom')} $${min}` : `$${min}`;
                  })();
                  return price ?? t('tours.priceFree');
                })()}
              </span>
            </Badge>
          </div>
          
          {/* City Badge */}
          {tour.city && (
            <div className="absolute bottom-3 left-3 z-30">
              <Badge variant="outline" className="bg-background/95 backdrop-blur-sm border-white/30 shadow-lg">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="text-xs font-medium">
                  {tour.city.name || 'City'}
                  {tour.distance !== undefined && ` • ${tour.distance.toFixed(1)} km`}
                </span>
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4 flex-1 flex flex-col">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {tour.name || 'Unnamed Tour'}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 flex-1">
            {tour.description || 'No description available'}
          </p>
          {tour.tags && tour.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tour.tags.slice(0, 3).map((tag, tagIndex) => (
                <Badge key={tagIndex} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tour.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tour.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};
