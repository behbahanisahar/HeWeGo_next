import { siteUrl } from "@/constants/constants";
import { Link } from "react-router-dom";

interface ICopyrightProps {
  className?: string;
}

export const CopyRight = ({ className }: ICopyrightProps) => {
  return (
    <p className={`text-sm text-muted-foreground text-center ${className || ""}`}>
      {'Copyright © '}
      <Link to={siteUrl} className="text-primary hover:underline">
        HeWeGo
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </p>
  );
};
