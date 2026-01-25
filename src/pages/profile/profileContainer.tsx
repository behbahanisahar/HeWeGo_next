import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Profile from "./profile";

const ProfileContainer = () => {
  return (
    <div className="container mx-auto px-4 sm:px-10 py-8 max-w-7xl">
      <div className="mb-8">
        <Profile />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Tours</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">View and manage your tours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Favorites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Your favorite destinations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Your travel groups</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileContainer;
