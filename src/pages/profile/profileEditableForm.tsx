import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CopyRight } from "@/components/copyRight/copyRight";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Context } from "@/context/AppContext";
import { updateUserInfo, IUpdateUserInfoPayload } from "@/api/users/putInfo";

const ProfileEditableForm = () => {
  const { t } = useTranslation();
  const appContext = useContext(Context);
  const userInfo = appContext?.state.userInfo;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<IUpdateUserInfoPayload>({
    name: "",
    email: "",
    city: "",
  });
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (userInfo?.id) {
      setFormData({
        name: userInfo.name || "",
        email: userInfo.email || "",
        city: userInfo.city || "",
      });
    }
  }, [userInfo?.id, userInfo?.name, userInfo?.email, userInfo?.city]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    try {
      const updatedUser = await updateUserInfo(formData);

      // Merge updated fields into existing user so we never lose the id or other properties,
      // even if the API returns only partial data (e.g. just the changed fields or a message).
      const mergedUser = {
        ...(appContext?.state.userInfo ?? {}),
        ...updatedUser,
        ...formData,
      };

      appContext?.actions.setUserInfo(mergedUser as typeof appContext.state.userInfo);

      // Persist updated user to same storage as token
      const tokenInLocal = localStorage.getItem("access_token");
      const storage = tokenInLocal ? localStorage : sessionStorage;
      storage.setItem("userInfo", JSON.stringify(mergedUser));
      setMessage(t("profile.saved") ?? "Profile saved");

      // After successful save, go back to profile page
      navigate("/profile", { replace: true });
    } catch {
      setError(true);
      setMessage(t("profile.checkInputs") ?? "Please check your inputs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-12 w-12 bg-primary">
              <AvatarFallback>
                <Edit className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold">{t('profile.editProfile')}</CardTitle>
          <CardDescription>
            {t('profile.updateInfo')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('profile.name')}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                autoFocus
                value={formData.name}
                onChange={handleChange}
                className={error ? "border-destructive" : ""}
                placeholder={t('profile.name')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('profile.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={error ? "border-destructive" : ""}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t('profile.city')}</Label>
              <Input
                id="city"
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleChange}
                className={error ? "border-destructive" : ""}
                placeholder={t('profile.city')}
              />
            </div>
            {message && (
              <p className={`text-sm ${error ? "text-destructive" : "text-emerald-600"}`}>
                {message}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Link to="/profile" className="w-full sm:w-auto order-2 sm:order-1">
                <Button type="button" variant="outline" className="w-full sm:w-auto">
                  {t('common.back')}
                </Button>
              </Link>
              <Button
                type="submit"
                className="w-full sm:w-auto order-1 sm:order-2"
                disabled={loading}
              >
                {loading ? t('profile.saving') : t('profile.submit')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
      <div className="py-4">
        <CopyRight />
      </div>
    </div>
  );
};

export default ProfileEditableForm;
