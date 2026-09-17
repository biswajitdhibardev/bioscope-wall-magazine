import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

import { createAdminClient } from '@/lib/supabase/admin';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { getArtworkImageUrl } from '@/lib/artwork-image';

export const dynamic = 'force-dynamic';

const SAMPLE_ARTWORKS = [
  { id: '44444444-4444-4444-4444-444444444441', title: 'Crimson Flow', image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600', artist: { name: 'Aria Chen' } },
  { id: '44444444-4444-4444-4444-444444444442', title: 'Iron Giants', image_url: 'https://images.unsplash.com/photo-1582561424760-0321d6df314a?w=600', artist: { name: 'Marcus Okafor' } },
  { id: '44444444-4444-4444-4444-444444444443', title: 'Digital Dawn', image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600', artist: { name: 'Elena Volkov' } },
  { id: '44444444-4444-4444-4444-444444444444', title: 'Neon Silence', image_url: 'https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=600', artist: { name: 'Raj Patel' } },
  { id: '44444444-4444-4444-4444-444444444445', title: 'Textile Memory', image_url: 'https://images.unsplash.com/photo-1601296200639-89349ce7e58b?w=600', artist: { name: 'Sofia Andersson' } },
  { id: '44444444-4444-4444-4444-444444444446', title: 'Azure Depth', image_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600', artist: { name: 'Aria Chen' } },
  { id: '44444444-4444-4444-4444-444444444447', title: 'Copper Winds', image_url: 'https://images.unsplash.com/photo-1544414981-d00e5da7f607?w=600', artist: { name: 'Marcus Okafor' } },
  { id: '44444444-4444-4444-4444-444444444448', title: 'Neural Network', image_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600', artist: { name: 'Elena Volkov' } },
  { id: '44444444-4444-4444-4444-444444444449', title: 'Shadow Play', image_url: 'https://images.unsplash.com/photo-1502219692488-87729f2705b1?w=600', artist: { name: 'Raj Patel' } },
  { id: '44444444-4444-4444-4444-444444444450', title: 'Luminous Threads', image_url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600', artist: { name: 'Sofia Andersson' } },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ artworkId: string }>;
}) {
  const { artworkId } = await params;

  const artwork = SAMPLE_ARTWORKS.find(
    (a) => a.id === artworkId
  );

  return {
    title: `Rate: ${artwork?.title || "Artwork"} | Bioscope Wall Magazine`,
    description: "Share your thoughts and reactions to this artwork.",
  };
}
export default async function FeedbackPage({ params }: { params: Promise<{ artworkId: string }>; }) { const { artworkId } = await params;
  const supabase = createAdminClient();
  
  // Try fetching from DB first
  const { data: dbArtwork } = await supabase
    .from('artworks')
    .select('id, title, image_url, image_path, artist:artists(name)')
    .eq('id', artworkId)
    .single();

  // Fallback to sample data if DB query fails or returns nothing
  const artwork = dbArtwork || SAMPLE_ARTWORKS.find(a => a.id === artworkId);

  if (!artwork) {
    notFound();
  }

  // Handle potential array or object for artist depending on Supabase mapping
  const artistField = artwork.artist as { name: string } | { name: string }[] | null | undefined;
  const artistName = Array.isArray(artistField)
    ? artistField[0]?.name || 'Unknown Artist'
    : artistField?.name || 'Unknown Artist';

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#fafafa] py-6 px-4 md:py-12">
      <div className="max-w-xl mx-auto">
        <Link 
          href={`/artwork/${artwork.id}`}
          className="inline-flex items-center gap-1 text-[#a3a3a3] hover:text-[#fafafa] transition-colors mb-6 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to artwork details
        </Link>
        
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-8 text-center md:text-left">
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden shrink-0 border border-[#262626]">
            <Image
              src={getArtworkImageUrl(artwork)}
              alt={artwork.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 128px, 160px"
              priority
            />
          </div>
          <div>
            <h1 className="font-playfair text-2xl md:text-3xl text-[#fafafa] mb-1">
              {artwork.title}
            </h1>
            <p className="text-[#a3a3a3]">by {artistName}</p>
          </div>
        </div>

        <FeedbackForm 
          artworkId={artwork.id} 
          artworkTitle={artwork.title} 
        />
      </div>
    </main>
  );
}
