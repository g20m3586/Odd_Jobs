import { supabase } from '@/lib/client'
import { NextResponse } from 'next/server'

export async function DELETE(_, { params }) {
  const { id } = params

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}