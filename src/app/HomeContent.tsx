'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, QrCode, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { getArtworkImageUrl } from '@/lib/artwork-image';

const Scene3D = dynamic(() => import('@/components/three/Scene3D'), { ssr: false });

export interface HomeFeaturedArtwork {
  id: string;
  title: string;
  image_path?: string | null;
  image_url?: string | null;
}

export interface HomeFeaturedExhibition {
  id: string;
  name: string;
  description: string | null;
  cover_image: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  artworks: HomeFeaturedArtwork[];
}

interface HomeContentProps { featuredExhibitions: HomeFeaturedExhibition[] }

export default function HomeContent({ featuredExhibitions }: HomeContentProps) {
  const titleText = 'Bioscope Wall Magazine';
  const letters = Array.from(titleText);
  const container: Variants = { hidden: { opacity: 0 }, visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.1 * i } }) };
  const child: Variants = { visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } }, hidden: { opacity: 0, y: 20, transition: { type: 'spring', damping: 12, stiffness: 100 } } };

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
        <Scene3D />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1a1a1a]/40 via-[#0a0a0a]/80 to-[#0a0a0a] -z-10" />
        <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center justify-center">
          <motion.div variants={container} initial="hidden" animate="visible" className="flex flex-wrap justify-center font-playfair text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            {letters.map((letter, index) => <motion.span key={index} variants={child} className={letter === ' ' ? 'mr-4' : 'text-[#fafafa] drop-shadow-xl'}>{letter}</motion.span>)}
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.8 }} className="text-xl md:text-2xl text-[#a3a3a3] font-light max-w-2xl mb-10">Where Art Meets the Digital Canvas</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.8 }} className="flex flex-col sm:flex-row gap-4"><Button size="lg" asChild className="group"><Link href="/artworks">Explore Gallery<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link></Button><Button size="lg" variant="outline" asChild><Link href="#how-it-works">Learn More</Link></Button></motion.div>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#a3a3a3]"><span className="text-xs uppercase tracking-widest">Scroll</span><div className="w-[1px] h-12 bg-gradient-to-b from-[#a3a3a3] to-transparent" /></motion.div>
      </section>

      <section className="py-24 bg-[#0a0a0a] relative noise-overlay">
        <div className="container mx-auto px-4 z-10 relative">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"><div><h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#fafafa] mb-4">Featured Exhibitions</h2><p className="text-[#a3a3a3] max-w-xl">Explore the exhibitions currently featured in the wall magazine, with the artworks curated inside each one.</p></div><Button variant="ghost" className="text-[#c9a84c] hover:text-[#d4b85c] hover:bg-[#c9a84c]/10" asChild><Link href="/artworks">View All <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>

          {featuredExhibitions.length > 0 ? (
            <div className="space-y-16">
              {featuredExhibitions.map((exhibition) => (
                <div key={exhibition.id} className="rounded-3xl border border-[#262626] bg-[#111111] overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
                    <Link href={`/exhibition/${exhibition.id}`} className="relative min-h-[280px] lg:min-h-[360px] group overflow-hidden">
                      {exhibition.cover_image ? <Image src={exhibition.cover_image} alt={exhibition.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 45vw" /> : <div className="absolute inset-0 bg-gradient-to-br from-[#202020] to-[#0a0a0a]" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute left-6 right-6 bottom-6"><span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 mb-3">{exhibition.is_active ? 'Featured' : 'Exhibition'}</span><h3 className="text-3xl font-playfair font-bold text-white">{exhibition.name}</h3></div>
                    </Link>
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <p className="text-[#a3a3a3] mb-6 line-clamp-3">{exhibition.description || 'Discover the artworks and artists featured in this exhibition.'}</p>
                      <div className="flex items-center justify-between mb-4"><h4 className="text-sm uppercase tracking-widest text-[#fafafa]">Related artworks</h4><Link href={`/exhibition/${exhibition.id}`} className="text-sm text-[#c9a84c] hover:underline">View exhibition →</Link></div>
                      {exhibition.artworks.length > 0 ? <div className="grid grid-cols-3 gap-3">{exhibition.artworks.slice(0, 3).map((artwork) => <Link href={`/artwork/${artwork.id}`} key={artwork.id} className="group"><div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-[#222]"><Image src={getArtworkImageUrl(artwork)} alt={artwork.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="160px" /></div><p className="text-xs text-[#d4d4d4] mt-2 truncate">{artwork.title}</p></Link>)}</div> : <div className="py-10 text-center rounded-xl border border-dashed border-[#333] text-sm text-[#666]">No published artworks in this exhibition yet.</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="py-20 text-center rounded-2xl border border-dashed border-[#333] text-[#666]">No featured exhibitions are available yet.</div>}
        </div>
      </section>

      <section id="how-it-works" className="py-24 bg-[#141414] border-t border-[#262626]"><div className="container mx-auto px-4"><div className="text-center mb-16"><h2 className="text-3xl md:text-4xl font-playfair font-bold text-[#fafafa] mb-4">How Bioscope Works</h2><p className="text-[#a3a3a3] max-w-2xl mx-auto">A seamless bridge between physical exhibitions and digital interaction.</p></div><div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative"><div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#262626] to-transparent" /><div className="flex flex-col items-center text-center relative z-10"><div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center mb-6 text-[#c9a84c]"><QrCode className="w-10 h-10" /></div><h3 className="text-xl font-semibold text-[#fafafa] mb-3">1. Scan QR Code</h3><p className="text-[#a3a3a3]">Find the unique QR code next to any physical artwork in our exhibition spaces.</p></div><div className="flex flex-col items-center text-center relative z-10"><div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center mb-6 text-[#8b5cf6]"><ImageIcon className="w-10 h-10" /></div><h3 className="text-xl font-semibold text-[#fafafa] mb-3">2. Explore Details</h3><p className="text-[#a3a3a3]">Unlock rich digital content, artist statements, and behind-the-scenes creation processes.</p></div><div className="flex flex-col items-center text-center relative z-10"><div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-[#262626] flex items-center justify-center mb-6 text-[#22c55e]"><MessageSquare className="w-10 h-10" /></div><h3 className="text-xl font-semibold text-[#fafafa] mb-3">3. Share Feedback</h3><p className="text-[#a3a3a3]">Leave live anonymous feedback, ratings, and thoughts that artists can review in real-time.</p></div></div></div></section>

      <section className="py-32 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] to-[#141414] -z-10" /><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#c9a84c]/5 rounded-full blur-[100px] -z-10 pointer-events-none" /><div className="container mx-auto px-4 text-center"><h2 className="text-4xl md:text-5xl font-playfair font-bold text-[#fafafa] mb-6">Ready to Experience Art?</h2><p className="text-xl text-[#a3a3a3] max-w-2xl mx-auto mb-10">Join the digital exhibition and start interacting with pieces from talented creators.</p><Button size="lg" variant="primary" asChild><Link href="/artworks">Enter Exhibition</Link></Button></div></section>
    </div>
  );
}
