import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function POST(req: NextRequest) {
  const { animalId, codigo } = await req.json()

  if (!animalId || !codigo) {
    return NextResponse.json({ valido: false }, { status: 400 })
  }

  const { data } = await supabase
    .from('animais')
    .select('codigo_gerenciamento')
    .eq('id', animalId)
    .single()

  const valido = !!data && data.codigo_gerenciamento === String(codigo).trim()
  return NextResponse.json({ valido })
}
