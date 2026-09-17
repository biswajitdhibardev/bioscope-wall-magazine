'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SuccessAnimationProps {
  onComplete?: () => void;
  artworkTitle?: string;
}

const PARTICLE_COUNT = 30;

export function SuccessAnimation({ onComplete, artworkTitle = 'the artwork' }: SuccessAnimationProps) {
  const prefersReducedMotion = useReducedMotion();

  // Generate the particle burst once, derived from whether the user prefers
  // reduced motion — no need for an effect + setState round-trip.
  const particles = React.useMemo(() => {
    if (prefersReducedMotion) return [];
    const colors = ['#c9a84c', '#8b5cf6', '#fafafa'];
    /* eslint-disable react-hooks/purity -- intentional: this is a one-off
       decorative particle burst that should differ each time the success
       screen appears, not a value that needs to be render-stable. */
    return Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: Math.random() * 0.5 + 0.5,
      rotation: Math.random() * 360,
      duration: 1 + Math.random(),
    }));
    /* eslint-enable react-hooks/purity */
  }, [prefersReducedMotion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleBackdropClick = () => {
    if (onComplete) onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={handleBackdropClick}
      >
        <div className="relative flex flex-col items-center text-center max-w-md w-full" onClick={(e) => e.stopPropagation()}>
          {/* Particles */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                animate={{ 
                  x: p.x, 
                  y: p.y, 
                  opacity: 0,
                  scale: p.scale,
                  rotate: p.rotation
                }}
                transition={{ 
                  duration: p.duration, 
                  ease: "easeOut",
                  delay: 0.8 // Wait for checkmark
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: p.color }}
              />
            ))}
          </div>

          {/* Checkmark Circle */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
            className="w-24 h-24 rounded-full bg-[#c9a84c]/20 flex items-center justify-center mb-6 relative"
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#c9a84c"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
                d="M20 6 9 17l-5-5"
              />
            </motion.svg>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="font-playfair text-3xl text-[#c9a84c] mb-2"
          >
            Thank you!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
            className="text-[#a3a3a3] mb-8"
          >
            Your feedback for <span className="text-[#fafafa]">&apos;{artworkTitle}&apos;</span> has been recorded.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <Link
              href="/artworks"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#262626] text-[#fafafa] hover:bg-[#404040] transition-colors min-h-[44px]"
              onClick={onComplete}
            >
              Browse More Artworks
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
