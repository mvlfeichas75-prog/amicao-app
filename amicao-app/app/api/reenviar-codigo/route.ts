import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function POST(req: NextRequest) {
  const { animalId, email } = await req.json()

  // Always return ok to avoid leaking whether an email is registered
  if (!animalId || !email) return NextResponse.json({ ok: true })

  const { data } = await supabase
    .from('animais')
    .select('email_anunciante, codigo_gerenciamento, nome')
    .eq('id', animalId)
    .single()

  const emailNormalizado = String(email).trim().toLowerCase()
  const corresponde =
    data &&
    data.email_anunciante?.toLowerCase() === emailNormalizado &&
    data.codigo_gerenciamento

  if (corresponde) {
    sendEmail(
      data.email_anunciante,
      'Seu código de gerenciamento — Amicão (reenvio)',
      `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
            <h1 style="color:#f97316;font-size:24px;margin-bottom:8px;">Amicão</h1>
            <p style="color:#374151;font-size:15px;margin-bottom:16px;">
              Você solicitou o reenvio do código de gerenciamento do anúncio de
              <strong>${data.nome ?? 'animal'}</strong>.
            </p>
            <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <p style="color:#9a3412;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Código de gerenciamento</p>
              <p style="color:#f97316;font-size:40px;font-weight:700;letter-spacing:0.3em;font-family:monospace;margin:0;">${data.codigo_gerenciamento}</p>
            </div>
            <p style="color:#6b7280;font-size:13px;">
              Guarde este código em local seguro — ele é a única forma de gerenciar seu anúncio no Amicão.
            </p>
          </div>
        `,
    ).catch(err => console.error('[amicao] erro ao reenviar email:', err))
  }

  return NextResponse.json({ ok: true })
}
