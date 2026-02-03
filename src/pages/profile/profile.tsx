import { useContext, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Mail, MapPin, Edit, MapPinned, Plus, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Context } from "@/context/AppContext";
import type { IFavouriteItem } from "@/api/favourites/get";
import type { ITour } from "@/entities/tour";
import homepage from "@/images/homepage.jpg";
import img2 from "@/images/homepage2.jpg";
import img3 from "@/images/homepage3.jpg";

const TOUR_PLACEHOLDER_IMAGES = [homepage, img2, img3];

const Profile = () => {
  const { t } = useTranslation();
  const appContext = useContext(Context);
  const userInfo = appContext?.state.userInfo;
  const navigate = useNavigate();
  const createdTours: ITour[] = [...(userInfo?.created_tours ?? [])];
  const favorites = (appContext?.state.favorites ?? []) as IFavouriteItem[];

  useEffect(() => {
    if (userInfo?.id === undefined || userInfo?.id === 0) {
      navigate("/login", { replace: true });
    }
  }, [userInfo?.id, navigate]);

  if (userInfo?.id === undefined || userInfo?.id === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Profile hero card */}
      <Card className="w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-muted/50 via-background to-background shadow-sm">
        <div className="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
            <Avatar className="h-20 w-20 shrink-0 ring-4 ring-background shadow-md sm:h-24 sm:w-24">
              <AvatarFallback className="bg-primary/15 text-primary text-2xl font-semibold sm:text-3xl">
                {(userInfo?.name || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-3">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {userInfo?.name || "User"}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-medium">
                  {userInfo?.role ?? "user"}
                </Badge>
                {createdTours.length > 0 && (
                  <Badge className="bg-primary font-medium text-primary-foreground shadow-sm">
                    {t("profile.tourLeader")}
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:gap-6">
                <a
                  href={`mailto:${userInfo?.email}`}
                  className="flex items-center gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Mail className="h-4 w-4" />
                  </span>
                  <span className="truncate">{userInfo?.email}</span>
                </a>
                {userInfo?.city && (
                  <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <MapPin className="h-4 w-4" />
                    </span>
                    {userInfo.city}
                  </div>
                )}
              </div>
            </div>
            <Link to="/profile/edit" className="shrink-0 sm:ml-auto">
              <Button
                variant="outline"
                size="default"
                className="w-full flex flex-row items-center justify-center gap-2 sm:w-auto"
              >
                <Edit className="h-4 w-4 shrink-0" />
                <span>{t("profile.editProfile")}</span>
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* My favourites */}
      {favorites.length > 0 && (
        <Card className="w-full overflow-hidden rounded-2xl border shadow-sm">
          <CardHeader className="px-6 pb-4 pt-6 sm:px-8 sm:pb-5 sm:pt-8">
            <h2 className="flex items-center gap-3 text-lg font-semibold sm:text-xl">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Heart className="h-5 w-5" />
              </span>
              {t("tours.myFavourites")}
            </h2>
          </CardHeader>
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((fav, index) => {
                const imageSrc = TOUR_PLACEHOLDER_IMAGES[index % TOUR_PLACEHOLDER_IMAGES.length];
                const title = fav.name ?? `Tour ${fav.id}`;
                return (
                  <li key={fav.id}>
                    <Link
                      to={`/tour/${fav.id}`}
                      className="group block overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={imageSrc}
                          alt={title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold line-clamp-2 text-sm sm:text-base">
                          {title}
                        </h3>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* My created tours */}
      {createdTours.length > 0 && (
        <Card className="w-full overflow-hidden rounded-2xl border shadow-sm">
          <CardHeader className="space-y-4 px-6 pb-4 pt-6 sm:px-8 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:pb-5 sm:pt-8">
            <h2 className="flex items-center gap-3 text-lg font-semibold sm:text-xl">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPinned className="h-5 w-5" />
              </span>
              {t("tours.myCreatedTours")}
            </h2>
            <Link to="/tour/create" className="block sm:shrink-0">
              <Button
                size="default"
                variant="default"
                className="w-full flex flex-row items-center justify-center gap-2 sm:w-auto"
              >
                <Plus className="h-4 w-4 shrink-0" />
                <span>{t("tours.createTour")}</span>
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {createdTours.map((tour, index) => {
                const imageSrc = TOUR_PLACEHOLDER_IMAGES[index % TOUR_PLACEHOLDER_IMAGES.length];
                return (
                  <li key={tour.tour_id}>
                    <Link
                      to={`/tour/${tour.tour_id}`}
                      className="group block overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <img
                          src={imageSrc}
                          alt={tour.tour_name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-3 sm:p-4">
                        <h3 className="font-semibold line-clamp-2 text-sm sm:text-base">
                          {tour.tour_name}
                        </h3>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
