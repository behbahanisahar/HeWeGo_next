import { IAllTourItems } from "src/entities/tour";
import homepage from "@/images/homepage.jpg";
import img2 from "@/images/homepage2.jpg";
import img3 from "@/images/homepage3.jpg";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getPriceDisplay, formatPriceDisplay } from "@/utils/tourPrice";

interface AllTourCardProps {
  tour: IAllTourItems & { distance?: number };
}

export const AllTourCard = ({ tour }: AllTourCardProps) => {
  const { t } = useTranslation();
  const images = [homepage, img2, img3];
  const [currentImage, setCurrentImage] = useState(tour.id % images.length);
  const priceDisplay = formatPriceDisplay(getPriceDisplay(tour.prices), t);

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prevImage) => (prevImage + 1) % images.length);
  };

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prevImage) => (prevImage - 1 + images.length) % images.length);
  };

  return (
    <Link to={`/tour/${tour.id}`} className="block">
      <Card className="group relative overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105 h-full flex flex-col">
        <div className="relative w-full aspect-square overflow-hidden">
          <img
            src={images[currentImage]}
            alt={tour.name || "Tour image"}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
              onClick={handlePreviousImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="flex-1 flex flex-col p-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">
              {tour.name || "Empty Name"}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {tour.description || "No description available"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="text-xs font-medium">
              {priceDisplay}
            </Badge>
            {tour.city && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{tour.city.name}</span>
                {tour.distance !== undefined && (
                  <span className="ml-1 text-xs">({tour.distance.toFixed(1)} km)</span>
                )}
              </Badge>
            )}
            {tour.tags?.slice(0, 2).map((tag: string, index: number) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
