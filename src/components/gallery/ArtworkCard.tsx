'use client'

import React, { useState, useRef, MouseEvent as ReactMouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, MessageSquare } from 'lucide-react'
import { ArtworkWithArtist } from '@/lib/types'
import { cn } from '@/lib/utils'
import { getArtworkImageUrl } from '@/lib/artwork-image'

interface ArtworkCardProps {
  artwork: ArtworkWithArtist
}

export function ArtworkCard({ artwork }: ArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // Calculate rotation limits (max 10 degrees)
    const rotateX = -((y - centerY) / centerY) * 10
    const rotateY = ((x - centerX) / centerX) * 10
    
    setRotate({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 })
    setIsHovered(false)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsHovered(!isHovered)}
      style={{
        transform: `perspective(800px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
        transition: isHovered ? 'none' : 'transform 0.5s ease',
      }}
      className="relative w-full aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group bg-[#141414] border border-white/5"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src={getArtworkImageUrl(artwork)}
          alt={artwork.title}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            isHovered ? "scale-105" : "scale-100"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <div className="absolute top-4 right-4 z-20">
        <span className="px-3 py-1 text-xs font-medium bg-black/60 text-white backdrop-blur-md rounded-full border border-white/20">
          {artwork.category || 'Artwork'}
        </span>
      </div>

      <div className={cn(
        "absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent z-10 transition-opacity duration-300",
        isHovered ? "opacity-100" : "opacity-80"
      )} />

      <div className="absolute bottom-0 left-0 w-full p-6 z-20 flex flex-col justify-end h-full pointer-events-none">
        <h3 className="font-playfair text-2xl text-[#fafafa] font-bold leading-tight mb-1 drop-shadow-md">
          {artwork.title}
        </h3>
        <p className="text-[#fafafa]/80 font-inter text-sm mb-2 drop-shadow-md">
          {artwork.artist?.name || 'Unknown Artist'} {artwork.year ? `• ${artwork.year}` : ''}
        </p>
        
        <div className="overflow-hidden">
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: isHovered ? 'auto' : 0, 
              opacity: isHovered ? 1 : 0,
              marginTop: isHovered ? 8 : 0
            }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto"
          >
            <p className="text-[#fafafa]/70 text-sm mb-4 line-clamp-2">
              {artwork.medium}
              {artwork.description ? ` • ${artwork.description}` : ''}
            </p>
            <div className="flex items-center gap-3">
              <Link href={`/artwork/${artwork.id}`} className="flex-1 bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors text-sm font-medium">
                <Eye className="w-4 h-4" /> View
              </Link>
              <Link href={`/feedback/${artwork.id}`} className="flex-1 bg-[#c9a84c]/90 hover:bg-[#c9a84c] text-black backdrop-blur-sm rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors text-sm font-medium">
                <MessageSquare className="w-4 h-4" /> Feedback
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
