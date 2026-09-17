'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { ArrowLeft, Globe, Camera, MessageCircle, Palette, Book } from 'lucide-react'
import { Artist, ArtworkWithArtist, SocialLinks } from '@/lib/types'
import { ArtworkCard } from '@/components/gallery/ArtworkCard'

interface ArtistProfileContentProps {
  artist: Artist
  artworks: ArtworkWithArtist[]
}

export function ArtistProfileContent({ artist, artworks }: ArtistProfileContentProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  // Parse social links if it's a string, or use directly if object
  let socialLinks: SocialLinks = {}
  try {
    if (typeof artist.social_links === 'string') {
      socialLinks = JSON.parse(artist.social_links)
    } else if (typeof artist.social_links === 'object' && artist.social_links !== null) {
      socialLinks = artist.social_links as SocialLinks
    }
  } catch (e) {
    console.error('Failed to parse social links', e)
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-12 pt-24 min-h-screen flex flex-col gap-16"
    >
      {/* Navigation */}
      <motion.div variants={itemVariants}>
        <Link href="/artworks" className="inline-flex items-center gap-2 text-[#fafafa]/70 hover:text-[#c9a84c] transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium text-sm tracking-wide">BACK TO GALLERY</span>
        </Link>
      </motion.div>

      {/* Hero Section */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-10 items-center md:items-start">
        <div className="flex-shrink-0 relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-[#c9a84c]/20 p-1">
          <div className="w-full h-full rounded-full overflow-hidden relative bg-[#141414] flex items-center justify-center">
            {artist.profile_image ? (
              <Image 
                src={artist.profile_image} 
                alt={artist.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-5xl font-playfair text-[#c9a84c]">
                {artist.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col flex-1 items-center md:items-start text-center md:text-left gap-6">
          <div>
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-[#fafafa] font-bold mb-3">
              {artist.name}
            </h1>
            {artist.artistic_style && (
              <span className="inline-block px-4 py-1.5 bg-white/5 text-[#c9a84c] rounded-full text-sm font-medium border border-white/10">
                {artist.artistic_style}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {socialLinks.website && (
              <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                <Camera className="w-5 h-5" />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6 bg-[#141414] rounded-2xl p-8 md:p-10 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-5 h-5 text-[#c9a84c]" />
            <h2 className="font-playfair text-2xl text-[#fafafa]">Biography</h2>
          </div>
          <div className="text-[#fafafa]/80 font-inter text-base md:text-lg leading-relaxed whitespace-pre-line">
            {artist.biography || 'No biography available.'}
          </div>
        </div>

        {artist.education && (
          <div className="bg-[#141414] rounded-2xl p-8 md:p-10 border border-white/5 h-fit">
            <div className="flex items-center gap-3 mb-6">
              <Book className="w-5 h-5 text-[#c9a84c]" />
              <h2 className="font-playfair text-2xl text-[#fafafa]">Education & Awards</h2>
            </div>
            <div className="text-[#fafafa]/80 font-inter leading-relaxed whitespace-pre-line">
              {artist.education}
            </div>
          </div>
        )}
      </motion.div>

      {/* Artworks Section */}
      <motion.div variants={itemVariants} className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="font-playfair text-3xl text-[#fafafa]">
            Artworks by {artist.name.split(' ')[0]}
          </h2>
          <span className="text-white/50 text-sm">{artworks.length} works</span>
        </div>

        {artworks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={{...artwork, artist}} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-[#141414] rounded-2xl border border-white/5">
            <p className="text-white/50 font-inter text-lg">No published artworks available yet.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
