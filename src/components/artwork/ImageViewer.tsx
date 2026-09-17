'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ZoomOut, Maximize } from 'lucide-react'

interface ImageViewerProps {
  src: string
  alt: string
  className?: string
}

export function ImageViewer({ src, alt, className }: ImageViewerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  const openFullscreen = () => setIsFullscreen(true)

  const closeFullscreen = () => {
    setIsFullscreen(false)
    // Reset zoom and pan
    setTimeout(() => {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    }, 300)
  }

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        closeFullscreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  // Prevent scrolling on body when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  const handleWheel = (e: React.WheelEvent) => {
    if (!isFullscreen) return
    e.preventDefault()
    const zoomSensitivity = 0.1
    const newScale = e.deltaY < 0 ? scale + zoomSensitivity : scale - zoomSensitivity
    setScale(Math.min(Math.max(1, newScale), 5)) // Clamp scale between 1 and 5
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(2.5)
    }
  }

  const zoomIn = () => setScale(Math.min(scale + 0.5, 5))
  const zoomOut = () => {
    const newScale = Math.max(scale - 0.5, 1)
    setScale(newScale)
    if (newScale === 1) setPosition({ x: 0, y: 0 })
  }

  return (
    <>
      {/* Inline Image */}
      <div 
        className={`relative cursor-zoom-in overflow-hidden rounded-xl bg-[#141414] group ${className}`}
        onClick={openFullscreen}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 bg-black/50 backdrop-blur-sm p-3 rounded-full text-white transition-opacity transform scale-90 group-hover:scale-100">
            <Maximize className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
            onWheel={handleWheel}
          >
            {/* Top Bar Actions */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50">
              <div className="text-white/70 text-sm hidden md:block">
                Scroll to zoom • Click and drag to pan • Double click to toggle zoom
              </div>
              <div className="flex items-center gap-4 ml-auto">
                <div className="flex bg-white/10 rounded-lg overflow-hidden backdrop-blur-md">
                  <button onClick={zoomOut} className="p-2 hover:bg-white/20 text-white transition-colors" disabled={scale <= 1}>
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <div className="px-3 py-2 text-white text-sm font-medium border-x border-white/10 flex items-center justify-center min-w-[3rem]">
                    {Math.round(scale * 100)}%
                  </div>
                  <button onClick={zoomIn} className="p-2 hover:bg-white/20 text-white transition-colors" disabled={scale >= 5}>
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={closeFullscreen}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-md"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Draggable/Zoomable Image Area */}
            <div 
              ref={containerRef}
              className={`relative w-full h-full flex items-center justify-center ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : ''}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onDoubleClick={handleDoubleClick}
            >
              <motion.div
                animate={{ x: position.x, y: position.y, scale: scale }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-5xl aspect-square md:aspect-video"
                style={{ originX: 0.5, originY: 0.5 }}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                  draggable={false}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
