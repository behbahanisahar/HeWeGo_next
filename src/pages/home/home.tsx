import { destinations } from "@/constants/constants";
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const navigate = useNavigate();
  const handleExploreClick = () => {
    const userInfoString = localStorage.getItem('userInfo');
    if (!userInfoString) {
      navigate('/login');
    } else {
      navigate('/tour');
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-7xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Welcome to HeWeGo
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          The City is Yours to Discover!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {destinations.map((destination, index) => (
          <Card 
            key={index}
            className="group relative overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
          >
            <div className="relative w-full aspect-square overflow-hidden">
              <img
                src={destination.image}
                alt={destination.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end">
                <CardContent className="p-4 text-white w-full">
                  <h3 className="text-xl font-semibold mb-2">{destination.title}</h3>
                  <p className="text-sm text-gray-200">{destination.description}</p>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Explore More Destinations</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover a world of amazing places waiting for you to explore.
        </p>
        <Button 
          variant="outline" 
          size="lg"
          onClick={handleExploreClick}
          className="mt-4"
        >
          Explore Now
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
