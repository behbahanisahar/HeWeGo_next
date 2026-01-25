import { ReactNode } from "react";
import { Card as ShadcnCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CustomCardProps {
  children: ReactNode;
  className?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({ children, className }) => {
  return <ShadcnCard className={cn("", className)}>{children}</ShadcnCard>;
};

export default CustomCard;
