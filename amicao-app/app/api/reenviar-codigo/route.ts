import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  console.log('[reenviar-codigo] ▶ rota atingida')

  // Valida env vars logo no início para diagnóstico rápido
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const resendKey    = process.env.RESEND_API_KEY

  console.log('[reenviar-codigo] env vars — supabaseUrl:', !!supabaseUrl, '| supabaseKey:', !!supabaseKey, '| resendKey:', !!resendKey)

  if (!supabaseUrl || !supabaseKey) {
    console.error('[reenviar-codigo] ERRO: variáveis de ambiente do Supabase não configuradas')
    return NextResponse.json({ ok: false, motivo: 'erro_configuracao' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  let body: unknown
  try {
    body = await req.json()
  } catch (err) {
    console.error('[reenviar-codigo] ERRO: falha ao parsear body JSON:', err)
    return NextResponse.json({ ok: false, motivo: 'body_invalido' }, { status: 400 })
  }

  const { animalId, email } = body as { animalId?: string; email?: string }
  console.log('[reenviar-codigo] body recebido — animalId:', animalId, '| email:', email)

  if (!animalId || !email) {
    console.warn('[reenviar-codigo] parâmetros ausentes — animalId:', animalId, '| email:', email)
    return NextResponse.json({ ok: false, motivo: 'parametros_invalidos' }, { status: 400 })
  }

  // Busca o animal
  console.log('[reenviar-codigo] buscando animal id:', animalId)
  const { data, error: fetchError } = await supabase
    .from('animais')
    .select('email_anunciante, nome, codigo_gerenciamento')
    .eq('id', animalId)
    .single()

  if (fetchError) {
    console.error('[reenviar-codigo] ERRO ao buscar animal:', JSON.stringify(fetchError, null, 2))
    return NextResponse.json({ ok: false, motivo: 'animal_nao_encontrado' }, { status: 404 })
  }

  if (!data) {
    console.warn('[reenviar-codigo] animal não encontrado para id:', animalId)
    return NextResponse.json({ ok: false, motivo: 'animal_nao_encontrado' }, { status: 404 })
  }

  console.log('[reenviar-codigo] animal encontrado — nome:', data.nome, '| email_anunciante:', data.email_anunciante, '| tem codigo_gerenciamento:', !!data.codigo_gerenciamento)

  // Compara email
  const emailInformado   = String(email).trim().toLowerCase()
  const emailCadastrado  = (data.email_anunciante ?? '').toLowerCase()
  console.log('[reenviar-codigo] comparando emails — informado:', emailInformado, '| cadastrado:', emailCadastrado)

  if (emailInformado !== emailCadastrado) {
    console.log('[reenviar-codigo] emails não conferem — nenhuma ação tomada')
    return NextResponse.json({ ok: false, motivo: 'email_nao_encontrado' }, { status: 200 })
  }

  // Gera novo código
  const novoCodigo = String(Math.floor(100_000 + Math.random() * 900_000))
  console.log('[reenviar-codigo] novo código gerado:', novoCodigo)

  // Salva no banco
  const { error: updateError } = await supabase
    .from('animais')
    .update({ codigo_gerenciamento: novoCodigo })
    .eq('id', animalId)

  if (updateError) {
    console.error('[reenviar-codigo] ERRO ao salvar novo código no banco:', JSON.stringify(updateError, null, 2))
    return NextResponse.json({ ok: false, motivo: 'erro_interno' }, { status: 500 })
  }

  console.log('[reenviar-codigo] código salvo no banco com sucesso')

  // Envia email
  if (!resendKey) {
    console.error('[reenviar-codigo] RESEND_API_KEY não configurada — email não enviado')
    return NextResponse.json({ ok: false, motivo: 'erro_configuracao_email' }, { status: 500 })
  }

  const nomeAnimal = data.nome ?? 'animal'
  console.log('[reenviar-codigo] enviando email para:', data.email_anunciante)

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
    console.log('[reenviar-codigo] email enviado com sucesso para:', data.email_anunciante)
  } catch (err) {
    console.error('[reenviar-codigo] ERRO ao enviar email via Resend:', JSON.stringify(err, null, 2))
    return NextResponse.json({ ok: false, motivo: 'erro_email' }, { status: 500 })
  }

  console.log('[reenviar-codigo] ✓ concluído com sucesso')
  return NextResponse.json({ ok: true })
}
