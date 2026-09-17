'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Calendar, ArrowLeft } from 'lucide-react'
import { Exhibition, ArtworkWithArtist } from '@/lib/types'
import { ArtworkCard } from '@/components/gallery/ArtworkCard'
import { formatDate } from '@/lib/utils'

interface ExhibitionContentProps {
  exhibition: Exhibition
  artworks: ArtworkWithArtist[]
}

export function ExhibitionContent({ exhibition, artworks }: ExhibitionContentProps) {
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

  const startDateStr = exhibition.start_date ? formatDate(exhibition.start_date) : ''
  const endDateStr = exhibition.end_date ? formatDate(exhibition.end_date) : 'Ongoing'
  const dateRange = startDateStr ? `${startDateStr} — ${endDateStr}` : ''

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-20"
    >
      {/* Hero Cover */}
      <motion.div variants={itemVariants} className="relative w-full h-[50vh] min-h-[400px] max-h-[600px] bg-[#141414]">
        {exhibition.cover_image && (
          <Image
            src={exhibition.cover_image}
            alt={exhibition.name}
            fill
            className="object-cover opacity-60"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        
        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-end pb-12 pt-24 z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors group mb-auto w-fit">
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-sm tracking-wide">BACK TO HOME</span>
          </Link>
          
          <div className="max-w-3xl">
            {exhibition.is_active && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Currently Active
              </div>
            )}
            
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-7xl text-[#fafafa] font-bold leading-tight mb-4 drop-shadow-lg">
              {exhibition.name}
            </h1>
            
            {dateRange && (
              <div className="flex items-center gap-2 text-[#fafafa]/80 text-lg mb-6">
                <Calendar className="w-5 h-5 text-[#c9a84c]" />
                <span>{dateRange}</span>
              </div>
            )}
            
            <p className="text-[#fafafa]/80 font-inter text-lg md:text-xl leading-relaxed max-w-2xl">
              {exhibition.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Artworks Gallery */}
      <div className="container mx-auto px-4 pt-16">
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-playfair text-3xl text-[#fafafa]">
              Exhibition Artworks
            </h2>
            <span className="text-white/50 text-sm">{artworks.length} works</span>
          </div>

          {artworks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center bg-[#141414] rounded-2xl border border-white/5">
              <p className="text-white/50 font-inter text-lg">No artworks available for this exhibition yet.</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
