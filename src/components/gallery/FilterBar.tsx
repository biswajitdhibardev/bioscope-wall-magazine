'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { Artist } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FilterBarProps {
  categories: string[]
  artists: Artist[]
  activeCategory: string | null
  activeArtistId: string | null
  searchQuery: string
  onCategoryChange: (category: string | null) => void
  onArtistChange: (artistId: string | null) => void
  onSearchChange: (query: string) => void
}

export function FilterBar({
  categories,
  artists,
  activeCategory,
  activeArtistId,
  searchQuery,
  onCategoryChange,
  onArtistChange,
  onSearchChange
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery)
  const [prevSearchQuery, setPrevSearchQuery] = useState(searchQuery)

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, onSearchChange])

  // Keep localSearch in sync when searchQuery changes externally (e.g. cleared
  // by a parent), adjusting state during render instead of via an effect.
  if (searchQuery !== prevSearchQuery) {
    setPrevSearchQuery(searchQuery)
    setLocalSearch(searchQuery)
  }

  const hasFilters = activeCategory !== null || activeArtistId !== null || searchQuery !== ''

  const clearFilters = () => {
    onCategoryChange(null)
    onArtistChange(null)
    setLocalSearch('')
    onSearchChange('')
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6">
      {/* Categories Scrollable Area */}
      <div className="flex-1 w-full overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max">
          <button
            onClick={() => onCategoryChange(null)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors relative",
              activeCategory === null ? "text-black" : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
            )}
          >
            {activeCategory === null && (
              <motion.div
                layoutId="activeCategory"
                className="absolute inset-0 bg-[#c9a84c] rounded-full z-0"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">All Artworks</span>
          </button>
          
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors relative",
                activeCategory === category ? "text-black" : "text-white/70 hover:text-white bg-white/5 hover:bg-white/10"
              )}
            >
              {activeCategory === category && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-[#c9a84c] rounded-full z-0"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{category}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {/* Search */}
        <div className="relative flex-1 md:w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search artworks..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-[#141414] border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
          />
        </div>

        {/* Artist Select */}
        <select
          value={activeArtistId || ''}
          onChange={(e) => onArtistChange(e.target.value || null)}
          className="bg-[#141414] border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#c9a84c]/50 appearance-none min-w-[120px]"
        >
          <option value="">All Artists</option>
          {artists.map((artist) => (
            <option key={artist.id} value={artist.id}>
              {artist.name}
            </option>
          ))}
        </select>

        {/* Clear Filters */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            title="Clear filters"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        )}
      </div>
    </div>
  )
}
