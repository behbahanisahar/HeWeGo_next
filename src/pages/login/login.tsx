import * as React from "react";
import { useState } from "react";
import { ILoginPostData, ILoginResponse, postLoginData } from "@/api/login/post";
import { CopyRight } from "@/components/copyRight/copyRight";
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Lock } from "lucide-react";

function LogIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ILoginPostData>({
    username: "",
    password: "",
  });
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
      await postLoginData(formData).then((l: ILoginResponse) => {
        localStorage.setItem('userInfo', JSON.stringify(l.user));
        localStorage.setItem('access_token', l.access_token);
      });
      toast('You are logged in successfully!', {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      navigate('/tour');
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
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
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Email Address</Label>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={error ? "border-destructive" : ""}
                placeholder="Enter your password"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">
                Invalid email or password. Please try again.
              </p>
            )}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember me
              </Label>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
              <Link
                to="#"
                className="text-primary hover:underline"
              >
                Forgot password?
              </Link>
              <Link
                to="/register"
                className="text-primary hover:underline"
              >
                Don't have an account? Sign Up
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

export default LogIn;
