import { NextResponse } from 'next/server'
import { supabase } from '@/lib/client'

export async function PATCH(request, { params }) {
  const { status } = await request.json()
  
  // Verify ownership
  const { data: { user } } = await supabase.auth.getUser()
  const { data: application } = await supabase
    .from('applications')
    .select('business_id')
    .eq('id', params.id)
    .single()

  if (user.id !== application.business_id) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 403 }
    )
  }

  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', params.id)

  if (error) {
    return NextResponse.json(
      { error: error.message }, 
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}