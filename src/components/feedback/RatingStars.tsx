'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { MAX_RATING } from '@/lib/constants';

interface RatingStarsProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const sizeConfig = {
  sm: 'w-6 h-6',     // 24px
  md: 'w-9 h-9',     // 36px
  lg: 'w-12 h-12',   // 48px
};

export function RatingStars({ value, onChange, size = 'md', disabled = false }: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (disabled) return;
    
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(index + 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(Math.min(value + 1, MAX_RATING || 5));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(Math.max(value - 1, 1));
    }
  };

  const stars = Array.from({ length: MAX_RATING || 5 }, (_, i) => i + 1);
  const displayValue = hovered !== null ? hovered : value;

  return (
    <div 
      className={cn('flex items-center gap-2', disabled && 'opacity-50 pointer-events-none')}
      role="radiogroup"
      aria-label="Rating"
      aria-disabled={disabled}
    >
      {stars.map((star) => {
        const isFilled = star <= displayValue;
        
        return (
          <motion.div
            key={star}
            whileTap={disabled ? undefined : { scale: 0.9 }}
            whileHover={disabled ? undefined : { scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="cursor-pointer flex items-center justify-center p-1 touch-manipulation min-w-[44px] min-h-[44px]"
            onMouseEnter={() => !disabled && setHovered(star)}
            onMouseLeave={() => !disabled && setHovered(null)}
            onClick={() => !disabled && onChange(star)}
            onKeyDown={(e) => handleKeyDown(e, star - 1)}
            role="radio"
            aria-checked={value === star}
            tabIndex={disabled ? -1 : 0}
            aria-label={`Rate ${star} out of ${stars.length}`}
          >
            <Star
              className={cn(
                sizeConfig[size],
                'transition-colors duration-200',
                isFilled ? 'fill-[#c9a84c] text-[#c9a84c]' : 'fill-transparent text-[#404040]'
              )}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
