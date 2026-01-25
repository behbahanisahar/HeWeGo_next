import { IAllTourItems } from "src/entities/tour";
import img2 from "@/images/homepage2.jpg";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface MyTourCardProps {
  tour: IAllTourItems;
}

export const MyTourCard = ({ tour }: MyTourCardProps) => {
  const tourPageUrl = `/tour/${tour.id}`;

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1 flex items-center gap-4">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
          <img 
            src={img2} 
            alt={tour.name || "Tour"} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2 line-clamp-1">
            {tour.name || "Unnamed Tour"}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {tour.tags?.map((tag: string, index: number) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {tour.description || "No description available"}
          </p>
        </div>
      </div>
      <div className="flex-shrink-0">
        <Link to={tourPageUrl}>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <ChevronRight className="h-5 w-5" />
          </div>
        </Link>
      </div>
    </div>
  );
};
