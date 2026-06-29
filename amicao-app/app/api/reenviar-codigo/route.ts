import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function POST(req: NextRequest) {
  const { animalId, email } = await req.json()

  if (!animalId || !email) {
    return NextResponse.json({ ok: false, motivo: 'parametros_invalidos' }, { status: 400 })
  }

  const { data, error: fetchError } = await supabase
    .from('animais')
    .select('email_anunciante, nome')
    .eq('id', animalId)
    .single()

  if (fetchError || !data) {
    console.error('[amicao] reenviar-codigo: erro ao buscar animal:', JSON.stringify(fetchError, null, 2))
    return NextResponse.json({ ok: false, motivo: 'animal_nao_encontrado' }, { status: 404 })
  }

  const emailNormalizado = String(email).trim().toLowerCase()
  const corresponde = data.email_anunciante?.toLowerCase() === emailNormalizado

  if (!corresponde) {
    console.log('[amicao] reenviar-codigo: email não confere — informado:', emailNormalizado, '| cadastrado:', data.email_anunciante?.toLowerCase())
    return NextResponse.json({ ok: false, motivo: 'email_nao_encontrado' }, { status: 200 })
  }

  const novoCodigo = String(Math.floor(100_000 + Math.random() * 900_000))

  const { error: updateError } = await supabase
    .from('animais')
    .update({ codigo_gerenciamento: novoCodigo })
    .eq('id', animalId)

  if (updateError) {
    console.error('[amicao] reenviar-codigo: erro ao salvar novo código:', JSON.stringify(updateError, null, 2))
    return NextResponse.json({ ok: false, motivo: 'erro_interno' }, { status: 500 })
  }

  const nomeAnimal = data.nome ?? 'animal'

  try {
    await sendEmail(
      data.email_anunciante,
      'Seu novo código de gerenciamento — Amicão',
      `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <h1 style="color:#f97316;font-size:24px;margin-bottom:8px;">Amicão</h1>
          <p style="color:#374151;font-size:15px;margin-bottom:16px;">
            Você solicitou um novo código de gerenciamento para o anúncio de
            <strong>${nomeAnimal}</strong>. Um novo código foi gerado e o anterior
            foi invalidado.
          </p>
          <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="color:#9a3412;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Novo código de gerenciamento</p>
            <p style="color:#f97316;font-size:40px;font-weight:700;letter-spacing:0.3em;font-family:monospace;margin:0;">${novoCodigo}</p>
          </div>
          <p style="color:#6b7280;font-size:13px;">
            Guarde este código em local seguro — ele é a única forma de gerenciar seu anúncio no Amicão.
          </p>
        </div>
      `,
    )
  } catch (err) {
    console.error('[amicao] reenviar-codigo: erro ao enviar email:', JSON.stringify(err, null, 2))
    return NextResponse.json({ ok: false, motivo: 'erro_email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
