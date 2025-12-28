import { supabaseClient } from '@/supabase/client'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { data, error } = await supabaseClient.from('presets').select('*')

  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const { label, properties } = body

  const { data, error } = await supabaseClient.from('presets').upsert(
    {
      label,
      properties,
    },
    {
      onConflict: 'id',
    },
  )

  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ data })
}

export async function DELETE(request: NextRequest) {
  const body = await request.json()

  const { id } = body

  const { data, error } = await supabaseClient
    .from('presets')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json({ data })
}
