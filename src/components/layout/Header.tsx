'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
// Note: Assuming NAV_LINKS is in constants.ts. If not, we define it here or import.
// For now, let's define it or assume it's in constants
import { NAV_LINKS } from '@/lib/constants';

// Fallback if NAV_LINKS doesn't exist
const LINKS = NAV_LINKS || [
  { href: '/', label: 'Home' },
  { href: '/artworks', label: 'Gallery' },
  { href: '/about', label: 'About' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = React.useState(pathname);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change (adjust state during render, avoiding an extra effect + re-render)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled ? 'bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#262626] py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 focus-ring rounded-md">
          <span className="font-playfair text-2xl font-bold tracking-tight text-[#fafafa]">
            Bioscope<span className="text-[#c9a84c]">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-[#c9a84c] focus-ring rounded-sm',
                pathname === link.href ? 'text-[#c9a84c]' : 'text-[#a3a3a3]'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-[#fafafa] hover:text-[#c9a84c] focus-ring rounded-md"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[280px] bg-[#141414] border-l border-[#262626] z-50 flex flex-col p-6 shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-between mb-10">
                <span className="font-playfair text-xl font-bold text-[#fafafa]">
                  Menu
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-[#a3a3a3] hover:text-[#fafafa] focus-ring rounded-full bg-[#1a1a1a]"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-4">
                {LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-lg font-medium transition-colors p-2 rounded-md hover:bg-[#1a1a1a]',
                      pathname === link.href ? 'text-[#c9a84c] bg-[#1a1a1a]/50' : 'text-[#fafafa]'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
