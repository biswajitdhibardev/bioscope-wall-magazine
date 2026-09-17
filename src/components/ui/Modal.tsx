'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  // SSR-safe "has this hydrated on the client yet" flag, without an effect+state dance.
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Keep the latest close handler without making the modal effect re-run on
  // every parent render. Re-running it while typing can steal focus from the
  // active input and make controlled fields accept only one character at a time.
  const onCloseRef = React.useRef(onClose);
  React.useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      // Focus the first field only when the modal opens, not on every render.
      const focusTimer = window.setTimeout(() => {
        const focusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement | null;
        if (focusable) focusable.focus();
      }, 50);

      return () => {
        window.clearTimeout(focusTimer);
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }

    document.body.style.overflow = 'unset';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    full: 'max-w-[95vw] h-[95vh]',
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full rounded-xl border border-[#262626] bg-[#141414] shadow-2xl overflow-hidden flex flex-col',
              sizeClasses[size],
              size === 'full' && 'h-full',
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            {title && (
              <div className="flex items-center justify-between border-b border-[#262626] px-6 py-4">
                <h2 id="modal-title" className="text-xl font-playfair font-semibold text-[#fafafa]">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-[#a3a3a3] hover:bg-[#262626] hover:text-[#fafafa] transition-colors focus-ring"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            {!title && (
              <button
                onClick={onClose}
                className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-[#a3a3a3] hover:bg-[#262626] hover:text-[#fafafa] transition-colors focus-ring"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <div className={cn('p-6 overflow-y-auto', size === 'full' && 'flex-1')}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
