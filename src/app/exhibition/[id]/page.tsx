import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { Exhibition, ArtworkWithArtist } from '@/lib/types'
import { ExhibitionContent } from './ExhibitionContent'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createServerClient()
  const { data } = await supabase.from('exhibitions').select('name').eq('id', id).maybeSingle()
  return { title: data ? `${data.name} | Bioscope Wall Magazine` : 'Exhibition | Bioscope Wall Magazine' }
}

export default async function ExhibitionPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: exhibitionData, error: exhibitionError } = await supabase
    .from('exhibitions')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  if (exhibitionError || !exhibitionData) notFound()

  const { data: artworksData, error: artworksError } = await supabase
    .from('artworks')
    .select('*, artist:artists(*)')
    .eq('exhibition_id', id)
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  if (artworksError) console.error('Failed to load exhibition artworks:', artworksError)

  return <ExhibitionContent exhibition={exhibitionData as Exhibition} artworks={(artworksData ?? []) as unknown as ArtworkWithArtist[]} />
}
