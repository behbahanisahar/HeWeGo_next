import * as React from "react";
import { useState, useEffect } from "react";
import { CopyRight } from "@/components/copyRight/copyRight";
import { IProfilePostData } from "@/api/profile/post";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Edit } from "lucide-react";
import IUserInfo from "src/entities/userinfo";

const ProfileEditableForm = () => {
  const [formData, setFormData] = useState<IProfilePostData>({
    name: "",
    email: "",
    city: '',
  });
  const [error, setError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const userInfoString = localStorage.getItem('userInfo');
    if (userInfoString) {
      const parsedUserInfo: IUserInfo = JSON.parse(userInfoString);
      setFormData({
        name: parsedUserInfo.name || "",
        email: parsedUserInfo.email || "",
        city: parsedUserInfo.city || "",
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    setLoading(true);
    // TODO: Implement actual API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-12 w-12 bg-primary">
              <AvatarFallback>
                <Edit className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold">Edit Profile</CardTitle>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                autoFocus
                value={formData.name}
                onChange={handleChange}
                className={error ? "border-destructive" : ""}
                placeholder="Enter your name"
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
                value={formData.email}
                onChange={handleChange}
                className={error ? "border-destructive" : ""}
                placeholder="name@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                type="text"
                required
                value={formData.city}
                onChange={handleChange}
                className={error ? "border-destructive" : ""}
                placeholder="Enter your city"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">
                Please check your inputs and try again.
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Saving..." : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="absolute bottom-4 left-0 right-0">
        <CopyRight />
      </div>
    </div>
  );
};

export default ProfileEditableForm;
