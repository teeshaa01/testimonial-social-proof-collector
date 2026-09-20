import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

export const StarRating = ({
  value = 5,
  onChange,
  readOnly = false,
  size = 'md',
  className
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const currentVal = hoverRating || value;

  return (
    <div
      className={cn('inline-flex items-center gap-1', className)}
      onMouseLeave={() => !readOnly && setHoverRating(0)}
      role={readOnly ? 'img' : 'radiogroup'}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= currentVal;

        if (readOnly) {
          return (
            <Star
              key={star}
              className={cn(
                sizes[size],
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300'
              )}
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110 active:scale-90"
            onClick={() => onChange && onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            aria-label={`${star} star`}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-slate-100 text-slate-300 hover:text-amber-300'
              )}
            />
          </button>
        );
      })}
    </div>
  );
};
