import React from 'react'
import { Metadata } from 'next'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { Artist, ArtworkWithArtist } from '@/lib/types'
import { ArtistProfileContent } from './ArtistProfileContent'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  let title = 'Artist Profile'
  
  try {
    const supabase = await createServerClient()
    const { data } = await supabase
      .from('artists')
      .select('name')
      .eq('id', id)
      .single()
      
    if (data) {
      title = data.name
    }
  } catch {
    // Ignore error
  }

  return {
    title: `${title} | Bioscope Wall Magazine`,
  }
}

const SAMPLE_ARTIST: Artist = {
  id: '33333333-3333-3333-3333-333333333331',
  name: 'Aria Chen',
  biography: 'Aria Chen is a contemporary artist based in New York. Her work explores themes of identity, memory, and the digital landscape. She often blends traditional painting techniques with digital manipulation to create ethereal and thought-provoking compositions.\n\nHer process involves photographing physical environments and digitally altering them to reflect emotional states, blurring the line between reality and perception.',
  profile_image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
  artistic_style: 'Contemporary Digital Media',
  education: 'BFA, Rhode Island School of Design\nMFA, Yale School of Art\n\nAwards:\n- 2022 Digital Arts Fellowship\n- 2023 Emerging Artist Award',
  social_links: { instagram: 'https://instagram.com', website: 'https://example.com' },
  created_at: '',
  updated_at: ''
}

const SAMPLE_ARTWORKS: ArtworkWithArtist[] = [
  { id: '44444444-4444-4444-4444-444444444441', exhibition_id: '11111111-1111-1111-1111-111111111111', artist_id: '33333333-3333-3333-3333-333333333331', title: 'Abstract Resonance', description: 'A vibrant exploration of color.', medium: 'Acrylic on Canvas', dimensions: '100x120cm', year: 2023, category: 'Painting', image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 1, created_at: '', updated_at: '', artist: null },
  { id: '44444444-4444-4444-4444-444444444446', exhibition_id: '22222222-2222-2222-2222-222222222222', artist_id: '33333333-3333-3333-3333-333333333331', title: 'Form and Void', description: 'Minimalist sculpture.', medium: 'Marble', dimensions: '40x40x120cm', year: 2021, category: 'Sculpture', image_url: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 6, created_at: '', updated_at: '', artist: null },
]

const FALLBACK_ARTIST_IDS: Record<string, string> = {
  '33333333-3333-3333-3333-333333333331': 'Aria Chen',
  '33333333-3333-3333-3333-333333333332': 'Marcus Okafor',
  '33333333-3333-3333-3333-333333333333': 'Elena Volkov',
  '33333333-3333-3333-3333-333333333334': 'Raj Patel',
  '33333333-3333-3333-3333-333333333335': 'Sofia Andersson',
}

const FALLBACK_ARTWORKS_BY_ARTIST: Record<string, ArtworkWithArtist[]> = {
  '33333333-3333-3333-3333-333333333331': SAMPLE_ARTWORKS,
  '33333333-3333-3333-3333-333333333332': [
    { ...SAMPLE_ARTWORKS[0], id: '44444444-4444-4444-4444-444444444442', artist_id: '33333333-3333-3333-3333-333333333332', title: 'Iron Giants', medium: 'Steel and Wire', category: 'Sculpture', image_url: 'https://images.unsplash.com/photo-1582561424760-0321d6df314a?w=800', artist: null },
    { ...SAMPLE_ARTWORKS[0], id: '44444444-4444-4444-4444-444444444447', artist_id: '33333333-3333-3333-3333-333333333332', title: 'Digital Horizons', medium: 'Digital', category: 'Digital Art', image_url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800', artist: null },
  ],
  '33333333-3333-3333-3333-333333333333': [
    { ...SAMPLE_ARTWORKS[0], id: '44444444-4444-4444-4444-444444444443', artist_id: '33333333-3333-3333-3333-333333333333', title: 'Digital Dawn', medium: 'Digital Render', category: 'Digital Art', image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800', artist: null },
    { ...SAMPLE_ARTWORKS[0], id: '44444444-4444-4444-4444-444444444448', artist_id: '33333333-3333-3333-3333-333333333333', title: 'Neural Network', medium: 'Generative Art', category: 'Digital Art', image_url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800', artist: null },
  ],
  '33333333-3333-3333-3333-333333333334': [
    { ...SAMPLE_ARTWORKS[0], id: '44444444-4444-4444-4444-444444444444', artist_id: '33333333-3333-3333-3333-333333333334', title: 'Neon Silence', medium: 'Digital Photography', category: 'Photography', image_url: 'https://images.unsplash.com/photo-1514905552197-0610a4d8fd73?w=800', artist: null },
    { ...SAMPLE_ARTWORKS[0], id: '44444444-4444-4444-4444-444444444449', artist_id: '33333333-3333-3333-3333-333333333334', title: 'Shadow Play', medium: 'Film Photography', category: 'Photography', image_url: 'https://images.unsplash.com/photo-1502219692488-87729f2705b1?w=800', artist: null },
  ],
  '33333333-3333-3333-3333-333333333335': [
    { ...SAMPLE_ARTWORKS[0], id: '44444444-4444-4444-4444-444444444445', artist_id: '33333333-3333-3333-3333-333333333335', title: 'Textile Memory', medium: 'Mixed Media', category: 'Mixed Media', image_url: 'https://images.unsplash.com/photo-1601296200639-89349ce7e58b?w=800', artist: null },
    { ...SAMPLE_ARTWORKS[0], id: '44444444-4444-4444-4444-444444444450', artist_id: '33333333-3333-3333-3333-333333333335', title: 'Luminous Threads', medium: 'Mixed Media', category: 'Mixed Media', image_url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800', artist: null },
  ],
}

export default async function ArtistPage({ params }: PageProps) {
  const { id } = await params
  let artist: Artist | null = null
  let artworks: ArtworkWithArtist[] = []

  try {
    const supabase = await createServerClient()
    
    // Fetch artist
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single()

    if (artistError) throw artistError
    if (artistData) {
      artist = artistData as Artist
    }

    // Fetch artworks
    if (artist) {
      const { data: artworksData, error: artworksError } = await supabase
        .from('artworks')
        .select('*')
        .eq('artist_id', id)
        .eq('is_published', true)
        .order('display_order', { ascending: true })

      if (artworksError) throw artworksError
      if (artworksData) {
        artworks = artworksData as unknown as ArtworkWithArtist[]
      }
    }
  } catch {
    console.warn('Failed to fetch from Supabase, using seeded fallback data')
    artist = { ...SAMPLE_ARTIST, id, name: FALLBACK_ARTIST_IDS[id] || SAMPLE_ARTIST.name }
    artworks = (FALLBACK_ARTWORKS_BY_ARTIST[id] || []).map((aw) => ({ ...aw, artist }))
  }

  if (!artist) {
    artist = { ...SAMPLE_ARTIST, id, name: FALLBACK_ARTIST_IDS[id] || SAMPLE_ARTIST.name }
    artworks = (FALLBACK_ARTWORKS_BY_ARTIST[id] || []).map((aw) => ({ ...aw, artist }))
  }

  return <ArtistProfileContent artist={artist} artworks={artworks} />
}
