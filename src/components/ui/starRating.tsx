import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  /** Current average (display only) */
  value?: number | null;
  /** Max stars (e.g. 5) */
  max?: number;
  /** Submit rating (value 1–max). If not provided, read-only. */
  onSubmit?: (rating: number) => void | Promise<void>;
  /** Disabled (e.g. not logged in) */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Size class for stars */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function StarRating({
  value = null,
  max = 5,
  onSubmit,
  disabled = false,
  loading = false,
  size = 'md',
  className,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<number | null>(null);
  const display = submitted ?? (hover != null ? hover : (value ?? 0));
  const isInteractive = Boolean(onSubmit && !disabled && !loading);

  const handleClick = async (rating: number) => {
    if (!onSubmit || disabled || loading) return;
    try {
      await onSubmit(rating);
      setSubmitted(rating);
    } catch (e) {
      console.error('Rating failed:', e);
    }
  };

  return (
    <div
      className={cn('inline-flex items-center gap-0.5', className)}
      onMouseLeave={() => isInteractive && setHover(null)}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= display;
        return (
          <button
            key={i}
            type="button"
            disabled={!isInteractive}
            className={cn(
              'p-0.5 rounded transition-colors',
              isInteractive && 'cursor-pointer hover:opacity-90',
              !isInteractive && 'cursor-default'
            )}
            onMouseEnter={() => isInteractive && setHover(starValue)}
            onClick={() => handleClick(starValue)}
            aria-label={`${starValue} ${starValue === 1 ? 'star' : 'stars'}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'shrink-0 transition-colors',
                filled
                  ? 'fill-amber-500 text-amber-500'
                  : 'text-muted-foreground/40'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
