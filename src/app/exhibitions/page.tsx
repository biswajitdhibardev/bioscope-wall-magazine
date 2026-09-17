import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getArtworkImageUrl } from '@/lib/artwork-image';

export const metadata: Metadata = {
  title: 'Exhibitions | Bioscope Wall Magazine',
  description: 'Explore featured exhibitions and the artworks inside them.',
};

export default async function ExhibitionsPage() {
  const supabase = await createClient();
  const { data: exhibitions, error } = await supabase
    .from('exhibitions')
    .select('id, name, description, cover_image, start_date, end_date, is_active, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const ids = (exhibitions ?? []).map((exhibition) => exhibition.id);
  const { data: artworks } = ids.length
    ? await supabase
        .from('artworks')
        .select('id, title, image_path, image_url, exhibition_id')
        .in('exhibition_id', ids)
        .eq('is_published', true)
        .order('display_order', { ascending: true })
    : { data: [] };

  if (error) console.error('Failed to load exhibitions:', error);

  return (
    <main className="container mx-auto px-4 py-12 pt-28 min-h-screen">
      <div className="mb-12">
        <h1 className="font-playfair text-4xl md:text-5xl text-[#fafafa] mb-4">Exhibitions</h1>
        <p className="text-[#fafafa]/70 max-w-2xl text-lg">Browse the exhibitions curated for the Bioscope Wall Magazine and explore the artworks belonging to each one.</p>
      </div>

      {exhibitions && exhibitions.length > 0 ? (
        <div className="space-y-12">
          {exhibitions.map((exhibition) => {
            const related = (artworks ?? []).filter((artwork) => artwork.exhibition_id === exhibition.id);
            return (
              <section key={exhibition.id} className="overflow-hidden rounded-3xl border border-[#262626] bg-[#141414]">
                <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr]">
                  <Link href={`/exhibition/${exhibition.id}`} className="relative min-h-[300px] group">
                    {exhibition.cover_image ? <Image src={exhibition.cover_image} alt={exhibition.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 45vw" /> : <div className="absolute inset-0 bg-gradient-to-br from-[#292929] to-[#0a0a0a]" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute left-6 right-6 bottom-6"><span className="inline-flex px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30 mb-3">Featured</span><h2 className="font-playfair text-3xl font-bold text-white">{exhibition.name}</h2></div>
                  </Link>
                  <div className="p-6 md:p-8">
                    <p className="text-[#a3a3a3] mb-7">{exhibition.description || 'Explore the artworks in this exhibition.'}</p>
                    <div className="flex items-center justify-between mb-4"><h3 className="text-sm uppercase tracking-widest text-white">Artworks ({related.length})</h3><Link href={`/exhibition/${exhibition.id}`} className="text-sm text-[#c9a84c] hover:underline">Open exhibition <ArrowRight className="inline w-4 h-4 ml-1" /></Link></div>
                    {related.length > 0 ? <div className="grid grid-cols-3 gap-3">{related.slice(0, 3).map((artwork) => <Link href={`/artwork/${artwork.id}`} key={artwork.id} className="group"><div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#222]"><Image src={getArtworkImageUrl(artwork)} alt={artwork.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="180px" /></div><p className="mt-2 text-xs text-[#d4d4d4] truncate">{artwork.title}</p></Link>)}</div> : <div className="py-10 text-center border border-dashed border-[#333] rounded-xl text-[#666]">No published artworks in this exhibition yet.</div>}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center rounded-2xl border border-dashed border-[#333] text-[#666]">No featured exhibitions are available yet.</div>
      )}
    </main>
  );
}
