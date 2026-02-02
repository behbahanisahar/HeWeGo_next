import { useContext, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, MapPin, Edit } from "lucide-react";
import { Context } from "@/context/AppContext";

const Profile = () => {
  const appContext = useContext(Context);
  const userInfo = appContext?.state.userInfo;
  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo?.id === undefined || userInfo?.id === 0) {
      navigate("/login", { replace: true });
    }
  }, [userInfo?.id, navigate]);

  if (userInfo?.id === undefined || userInfo?.id === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{userInfo?.name || "User"}</h2>
          </div>
          <Link to="/profile/edit">
            <Button variant="ghost" size="icon">
              <Edit className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{userInfo?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{userInfo?.city}</span>
            </div>
          </div>
          <div>
            <Badge variant="secondary">{userInfo?.role ?? "user"}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;
