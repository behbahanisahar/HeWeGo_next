import Profile from "./profile";
import { useTranslation } from "react-i18next";

const ProfileContainer = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {t("common.profile")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("profile.subtitle")}
        </p>
      </header>
      <Profile />
    </div>
  );
};

export default ProfileContainer;
