import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'compass' | 'mountain' | 'pin' | 'simple';
}

export const Logo = ({ className, showText = true, size = 'md', variant = 'compass' }: LogoProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const renderIcon = () => {
    switch (variant) {
      case 'compass':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <circle cx="12" cy="12" r="10" className="fill-primary stroke-primary-foreground" />
            <path d="m12 2 0 6M12 16l0 6M2 12l6 0M16 12l6 0" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 12l4-4" stroke="currentColor" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        );
      
      case 'mountain':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M3 20l9-7 9 7V4H3z" className="fill-primary stroke-primary-foreground" />
            <path d="M9 13l3-2 3 2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        );
      
      case 'pin':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" className="fill-primary stroke-primary-foreground" />
            <circle cx="12" cy="9" r="3" fill="currentColor" />
          </svg>
        );
      
      case 'simple':
      default:
        return (
          <div className="w-full h-full rounded-md bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">H</span>
          </div>
        );
    }
  };

  return (
    <Link to="/" className={cn("flex items-center gap-2 group", className)}>
      <div className={cn(
        "relative flex items-center justify-center rounded-lg text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
        sizeClasses[size]
      )}>
        {renderIcon()}
      </div>
      
      {showText && (
        <span className={cn(
          "font-bold tracking-tight text-foreground group-hover:text-primary transition-colors",
          textSizeClasses[size]
        )}>
          HeWeGo
        </span>
      )}
    </Link>
  );
};
