'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Logged server-side too, but this makes sure it's visible in the
    // browser console for quick debugging while developing.
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[#fafafa] px-4">
      <div className="max-w-md text-center">
        <h1 className="font-playfair text-2xl md:text-3xl mb-3">Something went wrong</h1>
        <p className="text-[#a3a3a3] mb-6">
          We couldn&apos;t load this page right now. This is usually temporary — please try again.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#c9a84c] hover:bg-[#d4b55c] text-black font-medium transition-colors min-h-[44px]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
