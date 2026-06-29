import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export async function POST(req: NextRequest) {
  const { animalId, nome, email, telefone, motivo } = await req.json()

  if (!animalId || !nome?.trim() || !email?.trim() || !motivo?.trim()) {
    return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 })
  }

  const { data: animal, error: fetchError } = await supabase
    .from('animais')
    .select('nome, email_anunciante')
    .eq('id', animalId)
    .single()

  if (fetchError || !animal) {
    return NextResponse.json({ error: 'Animal não encontrado.' }, { status: 404 })
  }

  const { error: insertError } = await supabase.from('adocoes').insert({
    animal_id: animalId,
    nome: nome.trim(),
    email: email.trim(),
    telefone: telefone?.trim() || null,
    motivo: motivo.trim(),
    status: 'interesse',
  })

  if (insertError) {
    console.error('[amicao] erro ao salvar interesse:', insertError)
    return NextResponse.json({ error: 'Erro ao salvar. Tente novamente.' }, { status: 500 })
  }

  if (animal.email_anunciante) {
    const nomeAnimal = animal.nome ?? 'animal'
    const linhaFone = telefone?.trim()
      ? `<tr>
          <td style="color:#6b7280;font-size:13px;padding:6px 0;width:80px;">Telefone</td>
          <td style="color:#374151;font-size:14px;font-weight:600;padding:6px 0;">${telefone.trim()}</td>
         </tr>`
      : ''

    sendEmail(
      animal.email_anunciante,
      `Alguém quer adotar ${nomeAnimal} — Amicão`,
      `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <h1 style="color:#f97316;font-size:24px;margin-bottom:8px;">Amicão</h1>
          <p style="color:#374151;font-size:16px;margin-bottom:24px;">
            Boa notícia! Alguém demonstrou interesse em adotar <strong>${nomeAnimal}</strong>.
          </p>
          <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;padding:24px;margin-bottom:24px;">
            <p style="color:#9a3412;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:12px;">
              Dados do interessado
            </p>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="color:#6b7280;font-size:13px;padding:6px 0;width:80px;">Nome</td>
                <td style="color:#374151;font-size:14px;font-weight:600;padding:6px 0;">${nome.trim()}</td>
              </tr>
              <tr>
                <td style="color:#6b7280;font-size:13px;padding:6px 0;">Email</td>
                <td style="color:#374151;font-size:14px;font-weight:600;padding:6px 0;">
                  <a href="mailto:${email.trim()}" style="color:#f97316;">${email.trim()}</a>
                </td>
              </tr>
              ${linhaFone}
            </table>
          </div>
          <div style="background:#f9fafb;border-radius:12px;padding:20px;margin-bottom:24px;">
            <p style="color:#9a3412;font-size:12px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">
              Por que quer adotar
            </p>
            <p style="color:#374151;font-size:14px;line-height:1.6;margin:0;white-space:pre-line;">${motivo.trim()}</p>
          </div>
          <p style="color:#6b7280;font-size:13px;">
            Entre em contato diretamente com o interessado pelo email ou telefone acima.
          </p>
        </div>
      `,
    ).catch(err => console.error('[amicao] erro ao enviar email de interesse:', err))
  }

  return NextResponse.json({ ok: true })
}
