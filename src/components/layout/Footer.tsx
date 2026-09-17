import * as React from 'react';
import Link from 'next/link';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#262626] bg-[#0a0a0a] py-8 mt-auto">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start">
          <Link href="/" className="font-playfair text-xl font-bold tracking-tight text-[#fafafa] focus-ring rounded-sm">
            Bioscope<span className="text-[#c9a84c]">.</span>
          </Link>
          <p className="text-sm text-[#a3a3a3] mt-1 text-center md:text-left">
            A curated digital art exhibition.
          </p>
        </div>
        <div className="text-sm text-[#a3a3a3]">
          &copy; {year} Bioscope Wall Magazine. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
