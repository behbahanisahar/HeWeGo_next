import * as React from "react";
import { useState, useRef } from "react";
import { ISignUpPostData, postSignUpData, isRegisterError } from "@/api/signUp/post";
import { CopyRight } from "@/components/copyRight/copyRight";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lock, Info } from "lucide-react";
import { useTranslation } from 'react-i18next';

const EMAIL_ALREADY_EXISTS_MESSAGE = "A user with this email already exists.";

interface IFieldErrors {
  name: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  city: boolean;
}

export default function SignUp() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<ISignUpPostData>({
    name: "",
    password: "",
    email: "",
    city: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<IFieldErrors>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    city: false,
  });
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isEmailExistsError, setIsEmailExistsError] = useState<boolean>(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");
    setIsEmailExistsError(false);
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFieldErrors({ ...fieldErrors, [name]: false });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const newFieldErrors = {
      name: formData.name.trim() === "",
      email: formData.email.trim() === "",
      password: formData.password.trim() === "",
      confirmPassword: formData.confirmPassword?.trim() === "",
      city: formData.city.trim() === "",
    };

    setFieldErrors(newFieldErrors);
    const formIsValid = !Object.values(newFieldErrors).some((error) => error);
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setMessage(t('signup.passwordsDontMatch'));
      setLoading(false);
      return;
    }
    
    if (formIsValid) {
      try {
        await postSignUpData(formData);

        setMessage(t('signup.accountCreated'));
        const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;
        setTimeout(() => navigate(fromPath || '/tour', { replace: true }), 800);
      } catch (error: unknown) {
        if (isRegisterError(error) && error.response?.status === 400) {
          const apiMessage = error.response.data?.message ?? '';
          if (apiMessage === EMAIL_ALREADY_EXISTS_MESSAGE || apiMessage.toLowerCase().includes('already exists')) {
            setMessage(t('signup.emailExists'));
            setFieldErrors((prev) => ({ ...prev, email: true }));
            setIsEmailExistsError(true);
            emailInputRef.current?.focus();
            setLoading(false);
            return;
          }
        }
        setMessage(t('signup.errorOccurred'));
      }
    } else {
      setMessage(t('signup.fillAllFields'));
    }
    setLoading(false);
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
          <CardTitle className="text-2xl font-bold">{t('signup.title')}</CardTitle>
          <CardDescription>
            {t('signup.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('signup.fullName')}</Label>
              <Input
                id="name"
                name="name"
                type="text"
                autoComplete="given-name"
                required
                autoFocus
                onChange={handleChange}
                className={fieldErrors.name ? "border-destructive" : ""}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={isEmailExistsError ? "text-destructive" : ""}>
                {t('signup.email')}
              </Label>
              <Input
                ref={emailInputRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                onChange={handleChange}
                className={fieldErrors.email || isEmailExistsError ? "border-destructive focus-visible:ring-destructive" : ""}
                placeholder="name@example.com"
                aria-invalid={fieldErrors.email || isEmailExistsError}
                aria-describedby={isEmailExistsError ? "email-exists-error" : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('signup.password')}</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                onChange={handleChange}
                className={fieldErrors.password ? "border-destructive" : ""}
                placeholder={t('signup.password')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('signup.confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                onChange={handleChange}
                className={fieldErrors.confirmPassword ? "border-destructive" : ""}
                placeholder={t('signup.confirmPassword')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t('signup.city')}</Label>
              <Input
                id="city"
                name="city"
                type="text"
                required
                onChange={handleChange}
                className={fieldErrors.city ? "border-destructive" : ""}
                placeholder={t('signup.city')}
              />
            </div>
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="allowExtraEmails"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="allowExtraEmails" className="text-sm font-normal cursor-pointer">
                {t('signup.marketingConsent')}
              </Label>
            </div>
            {message && (
              <div
                id="email-exists-error"
                role="alert"
                className={`flex items-center gap-2 p-3 rounded-md ${isEmailExistsError ? "bg-destructive/10 border border-destructive/20" : "bg-muted"}`}
              >
                <Info className={`h-4 w-4 shrink-0 ${isEmailExistsError ? "text-destructive" : "text-primary"}`} />
                <p className={`text-sm ${isEmailExistsError ? "text-destructive font-medium" : "text-foreground"}`}>
                  {message}
                </p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? t('signup.creatingAccount') : t('signup.signUp')}
            </Button>
            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                {t('signup.hasAccount')}
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
