import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import IUserInfo from "src/entities/userinfo";
import { User, Mail, MapPin, Edit } from "lucide-react";

const Profile = () => {
  const [userInfo, setUserInfo] = useState<IUserInfo>();
  useEffect(() => {
    const userInfoString = localStorage.getItem('userInfo');

    if (userInfoString) {
      const parsedUserInfo = JSON.parse(userInfoString);
      setUserInfo(parsedUserInfo);
    }
  }, []);

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
          <Link to="/profile/edit" target="_blank">
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
            <Badge variant="secondary">Guide</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Profile;
