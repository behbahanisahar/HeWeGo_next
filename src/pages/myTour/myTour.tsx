import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { AllMyTours } from "@/components/tour/allMyTours/allMyTours";

const MyTour = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">My Tours</h1>
          <p className="text-muted-foreground">Manage your tours</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto">
        <AllMyTours />
      </div>
    </div>
  );
};

export default MyTour;
