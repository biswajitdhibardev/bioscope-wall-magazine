'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FilterBar } from '@/components/gallery/FilterBar'
import { ArtworkCard } from '@/components/gallery/ArtworkCard'
import { ArtworkWithArtist, Artist } from '@/lib/types'
import { Frown } from 'lucide-react'

interface GalleryContentProps {
  initialArtworks: ArtworkWithArtist[]
  artists: Artist[]
  categories: string[]
}

export function GalleryContent({ initialArtworks, artists, categories }: GalleryContentProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeArtistId, setActiveArtistId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredArtworks = useMemo(() => {
    return initialArtworks.filter((artwork) => {
      const normalizeCategory = (value: string | null | undefined) =>
        value?.trim().toLowerCase().replace(/s$/, '') || ''

      // Compare normalized values so older records such as "Drawings" and
      // newer records such as "Drawing" are treated as the same category.
      const matchCategory = activeCategory
        ? normalizeCategory(artwork.category) === normalizeCategory(activeCategory)
        : true
      const matchArtist = activeArtistId ? artwork.artist_id === activeArtistId : true
      const matchSearch = searchQuery
        ? artwork.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          artwork.artist?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          artwork.description?.toLowerCase().includes(searchQuery.toLowerCase())
        : true

      return matchCategory && matchArtist && matchSearch
    })
  }, [initialArtworks, activeCategory, activeArtistId, searchQuery])

  return (
    <div className="flex flex-col gap-8">
      <FilterBar
        categories={categories}
        artists={artists}
        activeCategory={activeCategory}
        activeArtistId={activeArtistId}
        searchQuery={searchQuery}
        onCategoryChange={setActiveCategory}
        onArtistChange={setActiveArtistId}
        onSearchChange={setSearchQuery}
      />

      {filteredArtworks.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredArtworks.map((artwork) => (
              <motion.div
                layout
                key={artwork.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ArtworkCard artwork={artwork} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Frown className="w-12 h-12 text-white/20" />
          </div>
          <h3 className="font-playfair text-2xl text-white mb-2">No artworks found</h3>
          <p className="text-white/50 font-inter">
            Try adjusting your filters or search query to find what you&apos;re looking for.
          </p>
          <button
            onClick={() => {
              setActiveCategory(null)
              setActiveArtistId(null)
              setSearchQuery('')
            }}
            className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm font-medium transition-colors"
          >
            Clear all filters
          </button>
        </motion.div>
      )}
    </div>
  )
}
