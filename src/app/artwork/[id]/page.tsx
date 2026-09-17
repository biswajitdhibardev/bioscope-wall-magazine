import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ArtworkWithArtist, Artist } from '@/lib/types'
import { ArtworkDetailContent } from './ArtworkDetailContent'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  let title = 'Artwork Details'
  
  try {
    const supabase = createAdminClient()
    const { data } = await supabase
      .from('artworks')
      .select('title')
      .eq('id', id)
      .single()
      
    if (data) {
      title = data.title
    }
  } catch {
    // Ignore error
  }

  return {
    title: `${title} | Bioscope Wall Magazine`,
  }
}

// Fallback data
const SAMPLE_ARTIST: Artist = { 
  id: '1', name: 'Aria Chen', biography: 'Contemporary digital artist exploring the intersection of technology and human emotion.', 
  profile_image: '', artistic_style: 'Digital Abstract', education: 'BFA Digital Arts', social_links: { instagram: '', facebook: '', website: '' }, created_at: '', updated_at: '' 
}

const SAMPLE_ARTWORKS: ArtworkWithArtist[] = [
  { id: '44444444-4444-4444-4444-444444444441', exhibition_id: '11111111-1111-1111-1111-111111111111', artist_id: '33333333-3333-3333-3333-333333333331', title: 'Crimson Flow', description: 'An exploration of passion and anger using deep reds and fluid motion.', medium: 'Oil on Canvas', dimensions: '120x150cm', year: 2025, category: 'Painting', image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 1, created_at: '', updated_at: '', artist: SAMPLE_ARTIST },
  { id: '44444444-4444-4444-4444-444444444442', exhibition_id: '11111111-1111-1111-1111-111111111111', artist_id: '33333333-3333-3333-3333-333333333332', title: 'Iron Giants', description: 'Reclaimed steel welded into a complex geometric pattern.', medium: 'Steel and Wire', dimensions: '200x100x100cm', year: 2026, category: 'Sculpture', image_url: 'https://images.unsplash.com/photo-1582561424760-0321d6df314a?w=800', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 2, created_at: '', updated_at: '', artist: SAMPLE_ARTIST },
  { id: '44444444-4444-4444-4444-444444444443', exhibition_id: '11111111-1111-1111-1111-111111111111', artist_id: '33333333-3333-3333-3333-333333333333', title: 'Digital Dawn', description: 'A surreal sunrise breaking over a glitch-art landscape.', medium: 'Digital Render', dimensions: '4000x3000px', year: 2025, category: 'Digital Art', image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 3, created_at: '', updated_at: '', artist: SAMPLE_ARTIST },
  { id: '44444444-4444-4444-4444-444444444444', exhibition_id: '11111111-1111-1111-1111-111111111111', artist_id: '33333333-3333-3333-3333-333333333334', title: 'Neon Silence', description: 'A solitary figure standing beneath a flickering neon sign in Tokyo.', medium: 'Digital Photography', dimensions: '24x36in', year: 2024, category: 'Photography', image_url: 'https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=800', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 4, created_at: '', updated_at: '', artist: SAMPLE_ARTIST },
  { id: '44444444-4444-4444-4444-444444444445', exhibition_id: '11111111-1111-1111-1111-111111111111', artist_id: '33333333-3333-3333-3333-333333333335', title: 'Textile Memory', description: 'A fabric-based interactive piece that records touches.', medium: 'Mixed Media', dimensions: '100x100cm', year: 2026, category: 'Mixed Media', image_url: 'https://images.unsplash.com/photo-1601296200639-89349ce7e58b?w=800', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 5, created_at: '', updated_at: '', artist: SAMPLE_ARTIST },
  { id: '44444444-4444-4444-4444-444444444446', exhibition_id: '22222222-2222-2222-2222-222222222222', artist_id: '33333333-3333-3333-3333-333333333331', title: 'Azure Depth', description: 'Deep blues representing the ocean\'s mystery.', medium: 'Acrylic on Wood', dimensions: '100x100cm', year: 2026, category: 'Painting', image_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 6, created_at: '', updated_at: '', artist: SAMPLE_ARTIST },
  { id: '44444444-4444-4444-4444-444444444447', exhibition_id: '22222222-2222-2222-2222-222222222222', artist_id: '33333333-3333-3333-3333-333333333332', title: 'Copper Winds', description: 'Wind chimes constructed from industrial copper piping.', medium: 'Copper', dimensions: '300x50x50cm', year: 2025, category: 'Sculpture', image_url: 'https://images.unsplash.com/photo-1544414981-d00e5da7f607?w=800', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 7, created_at: '', updated_at: '', artist: SAMPLE_ARTIST },
  { id: '44444444-4444-4444-4444-444444444448', exhibition_id: '22222222-2222-2222-2222-222222222222', artist_id: '33333333-3333-3333-3333-333333333333', title: 'Neural Network', description: 'An AI-assisted generated visualization of synapses.', medium: 'Generative Art', dimensions: 'N/A', year: 2026, category: 'Digital Art', image_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 8, created_at: '', updated_at: '', artist: SAMPLE_ARTIST },
  { id: '44444444-4444-4444-4444-444444444449', exhibition_id: '22222222-2222-2222-2222-222222222222', artist_id: '33333333-3333-3333-3333-333333333334', title: 'Shadow Play', description: 'High contrast black and white study of architectural shadows.', medium: 'Film Photography', dimensions: '16x20in', year: 2023, category: 'Photography', image_url: 'https://images.unsplash.com/photo-1502219692488-87729f2705b1?w=800', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 9, created_at: '', updated_at: '', artist: SAMPLE_ARTIST },
  { id: '44444444-4444-4444-4444-444444444450', exhibition_id: '22222222-2222-2222-2222-222222222222', artist_id: '33333333-3333-3333-3333-333333333335', title: 'Luminous Threads', description: 'Fiber optics woven into traditional tapestry.', medium: 'Mixed Media', dimensions: '150x200cm', year: 2026, category: 'Mixed Media', image_url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 10, created_at: '', updated_at: '', artist: SAMPLE_ARTIST },
]
export default async function ArtworkPage({ params }: PageProps) {
  const { id } = await params
  let artwork: ArtworkWithArtist | null = null

  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('artworks')
      .select(`
        *,
        artist:artists(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }
    
    if (data) {
      artwork = data as unknown as ArtworkWithArtist
    }
  } catch {
    console.warn('Failed to fetch from Supabase, using seeded fallback data')
    const fallback = SAMPLE_ARTWORKS.find((item) => item.id === id)
    if (fallback) artwork = fallback
  }

  if (!artwork) {
    notFound()
  }

  return <ArtworkDetailContent artwork={artwork} />
}
