import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { email, codigo, nomeAnimal } = await req.json()

  if (!email || !codigo) {
    return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: 'Amicão <onboarding@resend.dev>',
      to: email,
      subject: 'Seu código de gerenciamento — Amicão',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <h1 style="color:#f97316;font-size:24px;margin-bottom:8px;">Amicão</h1>
          <p style="color:#374151;font-size:16px;margin-bottom:24px;">
            Seu anúncio de <strong>${nomeAnimal ?? 'cão'}</strong> foi publicado com sucesso!
          </p>
          <p style="color:#374151;font-size:15px;margin-bottom:16px;">
            Para gerenciar seu anúncio (alterar status, remover), use o código abaixo na página do animal:
          </p>
          <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
            <p style="color:#9a3412;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">Código de gerenciamento</p>
            <p style="color:#f97316;font-size:40px;font-weight:700;letter-spacing:0.3em;font-family:monospace;margin:0;">${codigo}</p>
          </div>
          <p style="color:#6b7280;font-size:13px;">
            Guarde este código em local seguro — ele é a única forma de gerenciar seu anúncio no Amicão.
          </p>
        </div>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[amicao] erro ao enviar email:', err)
    return NextResponse.json({ error: 'Falha ao enviar email.' }, { status: 500 })
  }
}
