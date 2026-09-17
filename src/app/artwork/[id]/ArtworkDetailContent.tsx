'use client'

import React from 'react'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { ArrowLeft, MessageSquare, ExternalLink } from 'lucide-react'
import { ArtworkWithArtist } from '@/lib/types'
import { ImageViewer } from '@/components/artwork/ImageViewer'
import { getArtworkImageUrl } from '@/lib/artwork-image'

interface ArtworkDetailContentProps {
  artwork: ArtworkWithArtist
}

export function ArtworkDetailContent({ artwork }: ArtworkDetailContentProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-12 pt-24 min-h-screen"
    >
      <Link href="/artworks" className="inline-flex items-center gap-2 text-[#fafafa]/70 hover:text-[#c9a84c] transition-colors mb-8 group">
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="font-medium text-sm tracking-wide">BACK TO GALLERY</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Image */}
        <motion.div variants={itemVariants} className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          <ImageViewer 
            src={getArtworkImageUrl(artwork)} 
            alt={artwork.title}
            className="w-full aspect-[4/5] md:aspect-auto md:h-[70vh]"
          />
          
          {artwork.video_url && (
            <div className="w-full bg-[#141414] rounded-xl overflow-hidden aspect-video border border-white/5">
              <video 
                src={artwork.video_url} 
                controls 
                className="w-full h-full object-cover"
                poster={getArtworkImageUrl(artwork)}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </motion.div>

        {/* Right Column: Info */}
        <motion.div variants={itemVariants} className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <div className="sticky top-24 flex flex-col gap-8">
            <div>
              <div className="flex items-start justify-between mb-4 gap-4">
                <h1 className="font-playfair text-4xl lg:text-5xl text-[#fafafa] font-bold leading-tight">
                  {artwork.title}
                </h1>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="px-3 py-1 text-xs font-medium bg-white/10 text-white rounded-full border border-white/10">
                  {artwork.category || 'Artwork'}
                </span>
                {artwork.year && (
                  <span className="text-[#fafafa]/60 text-sm">
                    {artwork.year}
                  </span>
                )}
              </div>

              <Link 
                href={`/artist/${artwork.artist_id}`}
                className="inline-block group"
              >
                <div className="text-xl text-[#c9a84c] font-medium group-hover:text-[#c9a84c]/80 transition-colors flex items-center gap-2">
                  {artwork.artist?.name || 'Unknown Artist'}
                  <ExternalLink className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </div>
              </Link>
            </div>

            <div className="h-px w-full bg-white/10" />

            <div className="space-y-4 text-[#fafafa]/80 font-inter text-base leading-relaxed">
              <p>{artwork.description || 'No description available for this artwork.'}</p>
            </div>

            <div className="bg-[#141414] rounded-xl p-6 border border-white/5 space-y-4">
              <h3 className="font-medium text-white mb-2 uppercase text-sm tracking-wider">Artwork Details</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <span className="block text-white/50 mb-1">Medium</span>
                  <span className="text-white">{artwork.medium || 'Not specified'}</span>
                </div>
                <div>
                  <span className="block text-white/50 mb-1">Dimensions</span>
                  <span className="text-white">{artwork.dimensions || 'Not specified'}</span>
                </div>
                {artwork.additional_info && (
                  <div className="col-span-2">
                    <span className="block text-white/50 mb-1">Additional Info</span>
                    <div className="text-white space-y-1">
                      {Object.entries(artwork.additional_info).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="text-white/50 capitalize">{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <Link 
                href={`/feedback/${artwork.id}`}
                className="w-full bg-[#c9a84c] hover:bg-[#c9a84c]/90 text-black py-4 px-8 rounded-xl font-medium text-lg flex items-center justify-center gap-3 transition-colors shadow-lg shadow-[#c9a84c]/20"
              >
                <MessageSquare className="w-5 h-5" />
                Rate this Artwork
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
