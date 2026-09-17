import React from 'react'
import { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { ArtworkWithArtist, Artist } from '@/lib/types'
import { ARTWORK_CATEGORIES } from '@/lib/constants'
import { GalleryContent } from './GalleryContent'

export const metadata: Metadata = {
  title: 'Gallery | Bioscope Wall Magazine',
  description: 'Explore our collection of artworks from featured artists.',
}

// Sample Data Fallback
const SAMPLE_ARTISTS: Artist[] = [
  { id: '33333333-3333-3333-3333-333333333331', name: 'Aria Chen', biography: '', profile_image: '', artistic_style: '', education: '', social_links: null, created_at: '', updated_at: '' },
  { id: '33333333-3333-3333-3333-333333333332', name: 'Marcus Okafor', biography: '', profile_image: '', artistic_style: '', education: '', social_links: null, created_at: '', updated_at: '' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Elena Volkov', biography: '', profile_image: '', artistic_style: '', education: '', social_links: null, created_at: '', updated_at: '' },
  { id: '33333333-3333-3333-3333-333333333334', name: 'Raj Patel', biography: '', profile_image: '', artistic_style: '', education: '', social_links: null, created_at: '', updated_at: '' },
  { id: '33333333-3333-3333-3333-333333333335', name: 'Sofia Andersson', biography: '', profile_image: '', artistic_style: '', education: '', social_links: null, created_at: '', updated_at: '' },
]

const SAMPLE_ARTWORKS: ArtworkWithArtist[] = [
  { id: '44444444-4444-4444-4444-444444444441', exhibition_id: '1', artist_id: '33333333-3333-3333-3333-333333333331', title: 'Abstract Resonance', description: 'A vibrant exploration of color.', medium: 'Acrylic on Canvas', dimensions: '100x120cm', year: 2023, category: 'Painting', image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 1, created_at: '', updated_at: '', artist: SAMPLE_ARTISTS[0] },
  { id: '44444444-4444-4444-4444-444444444442', exhibition_id: '1', artist_id: '33333333-3333-3333-3333-333333333332', title: 'Silent Observer', description: 'Portrait studies.', medium: 'Oil on Canvas', dimensions: '80x100cm', year: 2022, category: 'Painting', image_url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 2, created_at: '', updated_at: '', artist: SAMPLE_ARTISTS[1] },
  { id: '44444444-4444-4444-4444-444444444443', exhibition_id: '1', artist_id: '33333333-3333-3333-3333-333333333333', title: 'Modern Geometrics', description: 'Hard edge abstraction.', medium: 'Mixed Media', dimensions: '150x150cm', year: 2024, category: 'Digital Art', image_url: 'https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 3, created_at: '', updated_at: '', artist: SAMPLE_ARTISTS[2] },
  { id: '44444444-4444-4444-4444-444444444444', exhibition_id: '1', artist_id: '33333333-3333-3333-3333-333333333334', title: 'Gallery Space', description: 'Architectural views.', medium: 'Photography', dimensions: 'Prints available', year: 2023, category: 'Photography', image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 4, created_at: '', updated_at: '', artist: SAMPLE_ARTISTS[3] },
  { id: '44444444-4444-4444-4444-444444444445', exhibition_id: '1', artist_id: '33333333-3333-3333-3333-333333333335', title: 'Color Theory', description: 'Vibrant fluid art.', medium: 'Resin', dimensions: '60x60cm', year: 2023, category: 'Mixed Media', image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 5, created_at: '', updated_at: '', artist: SAMPLE_ARTISTS[4] },
  { id: '44444444-4444-4444-4444-444444444446', exhibition_id: '1', artist_id: '33333333-3333-3333-3333-333333333331', title: 'Form and Void', description: 'Minimalist sculpture.', medium: 'Marble', dimensions: '40x40x120cm', year: 2021, category: 'Sculpture', image_url: 'https://images.unsplash.com/photo-1482160549825-59d1b23cb208?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 6, created_at: '', updated_at: '', artist: SAMPLE_ARTISTS[0] },
  { id: '44444444-4444-4444-4444-444444444447', exhibition_id: '1', artist_id: '33333333-3333-3333-3333-333333333332', title: 'Digital Horizons', description: 'Landscape of tomorrow.', medium: 'Digital', dimensions: 'Variable', year: 2024, category: 'Digital Art', image_url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 7, created_at: '', updated_at: '', artist: SAMPLE_ARTISTS[1] },
  { id: '44444444-4444-4444-4444-444444444448', exhibition_id: '1', artist_id: '33333333-3333-3333-3333-333333333333', title: 'Textured Memories', description: 'Tactile surface studies.', medium: 'Mixed Media', dimensions: '90x90cm', year: 2022, category: 'Mixed Media', image_url: 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 8, created_at: '', updated_at: '', artist: SAMPLE_ARTISTS[2] },
  { id: '44444444-4444-4444-4444-444444444449', exhibition_id: '1', artist_id: '33333333-3333-3333-3333-333333333334', title: 'Urban Shadows', description: 'Street photography.', medium: 'Photography', dimensions: 'Prints available', year: 2023, category: 'Photography', image_url: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 9, created_at: '', updated_at: '', artist: SAMPLE_ARTISTS[3] },
  { id: '44444444-4444-4444-4444-444444444450', exhibition_id: '1', artist_id: '33333333-3333-3333-3333-333333333335', title: 'Light Box', description: 'Interactive installation.', medium: 'Installation', dimensions: 'Room size', year: 2024, category: 'Mixed Media', image_url: 'https://images.unsplash.com/photo-1501472312651-726afe119add?w=800&h=1000&fit=crop', video_url: null, audio_url: null, additional_info: null, is_published: true, display_order: 10, created_at: '', updated_at: '', artist: SAMPLE_ARTISTS[4] },
]

export default async function ArtworksPage() {
  let artworks: ArtworkWithArtist[] = []
  let artists: Artist[] = []

  try {
    // Public gallery reads are performed server-side with the service-role client.
    // This prevents a broken/stale public RLS policy from hiding published artwork.
    const supabase = createAdminClient()
    
    const { data: artworksData, error: artworksError } = await supabase
      .from('artworks')
      .select(`
        *,
        artist:artists(*)
      `)
      .eq('is_published', true)
      .order('display_order', { ascending: true })

    if (artworksError) throw artworksError
    if (artworksData) {
      artworks = artworksData as unknown as ArtworkWithArtist[]
    }

    const { data: artistsData, error: artistsError } = await supabase
      .from('artists')
      .select('*')
      .order('name', { ascending: true })

    if (artistsError) throw artistsError
    if (artistsData) {
      artists = artistsData as Artist[]
    }
  } catch {
    console.warn('Failed to fetch from Supabase, using fallback data')
    artworks = SAMPLE_ARTWORKS
    artists = SAMPLE_ARTISTS
  }

  // Build filter options from the actual published artworks, while keeping
  // the standard categories available for newly-added artwork. This prevents
  // the filter UI from drifting away from the category values stored in Supabase.
  const storedCategories = artworks
    .map((artwork) => artwork.category?.trim())
    .filter((category): category is string => Boolean(category))

  const categories: string[] = Array.from(
    new Set([
      ...ARTWORK_CATEGORIES,
      ...storedCategories,
    ])
  )

  return (
    <div className="container mx-auto px-4 py-12 pt-24 min-h-screen">
      <div className="mb-8">
        <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-[#fafafa] mb-4">Artwork Gallery</h1>
        <p className="text-[#fafafa]/70 font-inter max-w-2xl text-lg">
          Explore our diverse collection of works from talented artists across various mediums.
        </p>
      </div>

      <GalleryContent 
        initialArtworks={artworks} 
        artists={artists} 
        categories={categories} 
      />
    </div>
  )
}
