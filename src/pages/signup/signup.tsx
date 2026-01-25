import * as React from "react";
import { useState } from "react";
import { ISignUpPostData, postSignUpData } from "@/api/signUp/post";
import { CopyRight } from "@/components/copyRight/copyRight";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lock, Info } from "lucide-react";

interface IFieldErrors {
  name: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  city: boolean;
}

export default function SignUp() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");
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
    
    if (formIsValid) {
      try {
        await postSignUpData(formData);
        setMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } catch (error: any) {
        setMessage(error.message || "An error occurred. Please try again.");
      }
    } else {
      setMessage("Please fill in all mandatory fields!");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-12 w-12 bg-primary">
              <AvatarFallback>
                <Lock className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
          <CardDescription>
            Create a new account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
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
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                onChange={handleChange}
                className={fieldErrors.email ? "border-destructive" : ""}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                onChange={handleChange}
                className={fieldErrors.password ? "border-destructive" : ""}
                placeholder="Enter your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                onChange={handleChange}
                className={fieldErrors.confirmPassword ? "border-destructive" : ""}
                placeholder="Confirm your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                type="text"
                required
                onChange={handleChange}
                className={fieldErrors.city ? "border-destructive" : ""}
                placeholder="Enter your city"
              />
            </div>
            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="allowExtraEmails"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="allowExtraEmails" className="text-sm font-normal cursor-pointer">
                I want to receive inspiration, marketing promotions and updates via email.
              </Label>
            </div>
            {message && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                <Info className="h-4 w-4 text-primary" />
                <p className="text-sm text-foreground">{message}</p>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="absolute bottom-4 left-0 right-0">
        <CopyRight />
      </div>
    </div>
  );
}
