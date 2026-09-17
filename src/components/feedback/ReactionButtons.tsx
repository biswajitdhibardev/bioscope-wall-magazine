'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ReactionType, REACTION_OPTIONS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ReactionButtonsProps {
  selected: ReactionType[];
  onChange: (reactions: ReactionType[]) => void;
  disabled?: boolean;
}

const EMOJI_MAP: Record<string, string> = {
  'Inspiring': '✨',
  'Beautiful': '🎨',
  'Thought-provoking': '💭',
  'Creative': '🌟',
  'Emotional': '💝',
  'Unique': '🔮',
};

export function ReactionButtons({ selected, onChange, disabled = false }: ReactionButtonsProps) {
  const prefersReducedMotion = useReducedMotion();

  const toggleReaction = (reaction: ReactionType) => {
    if (disabled) return;
    
    if (selected.includes(reaction)) {
      onChange(selected.filter((r) => r !== reaction));
    } else {
      onChange([...selected, reaction]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, reaction: ReactionType) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleReaction(reaction);
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", disabled && "opacity-50 pointer-events-none")} role="group" aria-label="Reactions">
      {(REACTION_OPTIONS || Object.keys(EMOJI_MAP)).map((reaction) => {
        const isSelected = selected.includes(reaction as ReactionType);
        
        return (
          <motion.button
            key={reaction}
            layout={!prefersReducedMotion}
            whileTap={!disabled && !prefersReducedMotion ? { scale: 0.95 } : undefined}
            onClick={() => toggleReaction(reaction as ReactionType)}
            onKeyDown={(e) => handleKeyDown(e, reaction as ReactionType)}
            disabled={disabled}
            aria-pressed={isSelected}
            className={cn(
              "px-4 py-2 rounded-full border text-sm font-medium transition-colors touch-manipulation flex items-center gap-1.5 min-h-[44px]",
              isSelected 
                ? "border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]" 
                : "border-[#262626] text-[#a3a3a3] hover:border-[#404040] hover:text-[#d4d4d4] bg-transparent"
            )}
          >
            <span>{EMOJI_MAP[reaction as string] || '✨'}</span>
            <span>{reaction}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
