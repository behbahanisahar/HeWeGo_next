import * as React from "react";
import { useState, useContext } from "react";
import { CopyRight } from "@/components/copyRight/copyRight";
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lock } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Context } from "@/context/AppContext";
import { postLoginData } from "@/api/login/post";
import { useLocation } from "react-router-dom";

function LogIn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const appContext = useContext(Context);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      const response = await postLoginData({
        username: formData.username,
        password: formData.password,
      });
      appContext?.actions.setAuth(
        response.user,
        response.access_token,
        response.role,
        rememberMe
      );
      const fromLocation = (location.state as { from?: { pathname?: string } })?.from;
      navigate(fromLocation?.pathname || "/", { replace: true });
    } catch {
      setError(true);
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
                  <Lock className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold">{t('login.title')}</CardTitle>
            <CardDescription>
              {t('login.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t('login.email')}</Label>
                <Input
                  id="username"
                  name="username"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className={error ? "border-destructive" : ""}
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('login.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={error ? "border-destructive" : ""}
                  placeholder={t('login.password')}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">
                  {t('login.invalidCredentials')}
                </p>
              )}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  {t('login.rememberMe')}
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? t('login.signingIn') : t('login.signIn')}
              </Button>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
                <Link
                  to="#"
                  className="text-primary hover:underline"
                >
                  {t('login.forgotPassword')}
                </Link>
                <Link
                  to="/register"
                  className="text-primary hover:underline"
                >
                  {t('login.noAccount')}
                </Link>
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
}

export default LogIn;
