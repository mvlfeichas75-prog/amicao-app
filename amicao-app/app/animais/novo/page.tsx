'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const MAX_FOTOS = 5

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

type Convivencia = 'sim' | 'nao' | 'nao_testado'
type Alimentacao = 'racao' | 'caseira' | 'misto'

export default function NovoAnimalPage() {
  const router = useRouter()
  const inputFotoRef = useRef<HTMLInputElement>(null)

  // Fotos
  const [fotos, setFotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  // Identificação
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [idade, setIdade] = useState('')
  const [porte, setPorte] = useState<'pequeno' | 'medio' | 'grande'>('medio')
  const [sexo, setSexo] = useState<'macho' | 'femea' | 'desconhecido'>('desconhecido')
  const [castrado, setCastrado] = useState(false)
  const [vacinado, setVacinado] = useState(false)

  // Saúde
  const [passouPorVet, setPassouPorVet] = useState(false)
  const [condicaoSaude, setCondicaoSaude] = useState('')
  const [medicamento, setMedicamento] = useState('')

  // Comportamento
  const [alimentacao, setAlimentacao] = useState<Alimentacao>('racao')
  const [conviveCriancas, setConviveCriancas] = useState<Convivencia>('nao_testado')
  const [conviveCaes, setConviveCaes] = useState<Convivencia>('nao_testado')
  const [conviveGatos, setConviveGatos] = useState<Convivencia>('nao_testado')
  const [comportamentoEspecial, setComportamentoEspecial] = useState('')

  // Histórico
  const [tinhaDono, setTinhaDono] = useState(false)
  const [foiResgatado, setFoiResgatado] = useState(false)
  const [tempoNasRuas, setTempoNasRuas] = useState('')

  // Localização
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('SP')

  // Contato do resgatador (privado)
  const [resgatadorNome, setResgatadorNome] = useState('')
  const [resgatadorContato, setResgatadorContato] = useState('')

  // UI
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const novos = Array.from(e.target.files ?? [])
    e.target.value = ''
    const vagas = MAX_FOTOS - fotos.length
    if (vagas <= 0) return
    const adicionados = novos.slice(0, vagas)
    setFotos(prev => [...prev, ...adicionados])
    setPreviews(prev => [...prev, ...adicionados.map(f => URL.createObjectURL(f))])
  }

  function handleRemover(index: number) {
    URL.revokeObjectURL(previews[index])
    setFotos(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (!cidade.trim()) {
      setErro('Informe a cidade.')
      return
    }

    setLoading(true)

    try {
      const urls: string[] = []

      for (const foto of fotos) {
        const ext = foto.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { data: upload, error: uploadErro } = await supabase.storage
          .from('animais')
          .upload(path, foto, { upsert: false })
        if (uploadErro) throw new Error(`Upload falhou: ${uploadErro.message}`)
        const { data: urlData } = supabase.storage.from('animais').getPublicUrl(upload.path)
        urls.push(urlData.publicUrl)
      }

      const payload = {
        // Identificação
        nome: nome.trim() || null,
        descricao: descricao.trim() || null,
        idade_estimada: idade.trim() || null,
        porte,
        sexo,
        castrado,
        vacinado,
        // Saúde
        passou_por_vet: passouPorVet,
        condicao_saude: condicaoSaude.trim() || null,
        medicamento: medicamento.trim() || null,
        // Comportamento
        alimentacao,
        convive_criancas: conviveCriancas,
        convive_caes: conviveCaes,
        convive_gatos: conviveGatos,
        comportamento_especial: comportamentoEspecial.trim() || null,
        // Histórico
        tinha_dono: tinhaDono,
        foi_resgatado: foiResgatado,
        tempo_nas_ruas: tempoNasRuas.trim() || null,
        // Localização
        cidade: cidade.trim(),
        estado,
        // Fotos e status
        foto_url: urls.length > 0 ? JSON.stringify(urls) : null,
        status: 'disponivel',
        // Contato privado do resgatador
        resgatador_nome: resgatadorNome.trim() || null,
        resgatador_contato: resgatadorContato.trim() || null,
      }

      console.log('[amicao] payload do insert:', payload)

      const { data: insertData, error: insertErro } = await supabase
        .from('animais')
        .insert(payload)
        .select()

      console.log('[amicao] resultado do insert — data:', insertData, '| error:', insertErro)

      if (insertErro) {
        console.error('Supabase insert error:', insertErro)
        throw new Error(insertErro.message)
      }

      router.refresh()
      router.push('/animais')
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Link
        href="/animais"
        className="inline-flex items-center gap-1 text-orange-500 font-medium hover:underline mb-6"
      >
        ← Voltar à listagem
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">Anunciar cão</h1>
      <p className="text-gray-500 mb-8">Preencha as informações do animal para publicar o anúncio.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-8">

        {/* ── Fotos ── */}
        <Secao titulo="Fotos">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400">Opcional · máximo {MAX_FOTOS} · JPG, PNG ou WEBP</p>
              {fotos.length > 0 && (
                <span className="text-xs text-orange-600 font-medium">{fotos.length}/{MAX_FOTOS}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              {previews.map((src, i) => (
                <div key={src} className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemover(i)}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition"
                    aria-label="Remover foto"
                  >
                    <span className="text-white text-xl font-bold leading-none">×</span>
                  </button>
                </div>
              ))}
              {fotos.length < MAX_FOTOS && (
                <button
                  type="button"
                  onClick={() => inputFotoRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 flex flex-col items-center justify-center gap-1 text-orange-400 hover:border-orange-400 hover:text-orange-500 transition shrink-0"
                >
                  <span className="text-2xl leading-none">+</span>
                  <span className="text-xs">Adicionar</span>
                </button>
              )}
            </div>
            <input ref={inputFotoRef} type="file" accept="image/*" multiple onChange={handleFotoChange} className="hidden" />
          </div>
        </Secao>

        {/* ── Identificação ── */}
        <Secao titulo="Identificação">
          <Field label="Nome do animal (opcional)">
            <input type="text" value={nome} onChange={e => setNome(e.target.value)}
              placeholder="Ex: Bob, Rex…" className={inputClass} />
          </Field>

          <Field label="Descrição">
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
              rows={3} placeholder="Onde foi encontrado, contexto do resgate…"
              className={`${inputClass} resize-none`} />
          </Field>

          <Field label="Idade estimada">
            <input type="text" value={idade} onChange={e => setIdade(e.target.value)}
              placeholder="Ex: 2 anos, 6 meses, filhote…" className={inputClass} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Porte">
              <select value={porte} onChange={e => setPorte(e.target.value as typeof porte)} className={inputClass}>
                <option value="pequeno">Pequeno (até 10 kg)</option>
                <option value="medio">Médio (10–25 kg)</option>
                <option value="grande">Grande (acima de 25 kg)</option>
              </select>
            </Field>
            <Field label="Sexo">
              <select value={sexo} onChange={e => setSexo(e.target.value as typeof sexo)} className={inputClass}>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
                <option value="desconhecido">Desconhecido</option>
              </select>
            </Field>
          </div>

          <div className="flex gap-6">
            <Checkbox label="Castrado" checked={castrado} onChange={setCastrado} />
            <Checkbox label="Vacinado" checked={vacinado} onChange={setVacinado} />
          </div>
        </Secao>

        {/* ── Saúde ── */}
        <Secao titulo="Saúde">
          <Checkbox label="Passou por veterinário" checked={passouPorVet} onChange={setPassouPorVet} />

          <Field label="Condição de saúde conhecida">
            <input type="text" value={condicaoSaude} onChange={e => setCondicaoSaude(e.target.value)}
              placeholder="Ex: saudável, ferida na pata, desnutrido…" className={inputClass} />
          </Field>

          <Field label="Está tomando medicamento">
            <input type="text" value={medicamento} onChange={e => setMedicamento(e.target.value)}
              placeholder="Ex: antibiótico 2x ao dia…" className={inputClass} />
          </Field>
        </Secao>

        {/* ── Comportamento ── */}
        <Secao titulo="Comportamento">
          <Field label="Alimentação">
            <select value={alimentacao} onChange={e => setAlimentacao(e.target.value as Alimentacao)} className={inputClass}>
              <option value="racao">Ração</option>
              <option value="caseira">Comida caseira</option>
              <option value="misto">Misto</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Convive com crianças">
              <select value={conviveCriancas} onChange={e => setConviveCriancas(e.target.value as Convivencia)} className={inputClass}>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
                <option value="nao_testado">Não testado</option>
              </select>
            </Field>
            <Field label="Convive com cães">
              <select value={conviveCaes} onChange={e => setConviveCaes(e.target.value as Convivencia)} className={inputClass}>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
                <option value="nao_testado">Não testado</option>
              </select>
            </Field>
            <Field label="Convive com gatos">
              <select value={conviveGatos} onChange={e => setConviveGatos(e.target.value as Convivencia)} className={inputClass}>
                <option value="sim">Sim</option>
                <option value="nao">Não</option>
                <option value="nao_testado">Não testado</option>
              </select>
            </Field>
          </div>

          <Field label="Comportamento especial">
            <textarea value={comportamentoEspecial} onChange={e => setComportamentoEspecial(e.target.value)}
              rows={2} placeholder="Ex: medo de trovão, late muito, adora colo…"
              className={`${inputClass} resize-none`} />
          </Field>
        </Secao>

        {/* ── Histórico ── */}
        <Secao titulo="Histórico">
          <div className="flex flex-col gap-3">
            <Checkbox label="Tinha dono anterior" checked={tinhaDono} onChange={setTinhaDono} />
            <Checkbox label="Já foi resgatado antes" checked={foiResgatado} onChange={setFoiResgatado} />
          </div>

          <Field label="Tempo aproximado nas ruas">
            <input type="text" value={tempoNasRuas} onChange={e => setTempoNasRuas(e.target.value)}
              placeholder="Ex: 2 semanas, alguns meses, desconhecido…" className={inputClass} />
          </Field>
        </Secao>

        {/* ── Localização ── */}
        <Secao titulo="Localização">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Field label="Cidade *">
                <input type="text" value={cidade} onChange={e => setCidade(e.target.value)}
                  placeholder="Ex: São Paulo" required className={inputClass} />
              </Field>
            </div>
            <Field label="Estado">
              <select value={estado} onChange={e => setEstado(e.target.value)} className={inputClass}>
                {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </Field>
          </div>
        </Secao>

        {/* ── Contato do resgatador ── */}
        <Secao titulo="Contato do resgatador">
          <div className="bg-orange-50 text-orange-700 text-xs rounded-xl px-4 py-3">
            🔒 Estas informações <strong>não serão exibidas publicamente</strong>. Usadas apenas para comunicação interna caso necessário.
          </div>

          <Field label="Seu nome (opcional)">
            <input type="text" value={resgatadorNome} onChange={e => setResgatadorNome(e.target.value)}
              placeholder="Ex: Maria Silva" className={inputClass} />
          </Field>

          <Field label="WhatsApp ou e-mail (opcional)">
            <input type="text" value={resgatadorContato} onChange={e => setResgatadorContato(e.target.value)}
              placeholder="Ex: 11999999999 ou maria@email.com" className={inputClass} />
          </Field>
        </Secao>

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{erro}</div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-full hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Publicando…' : 'Publicar anúncio'}
        </button>
      </form>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition'

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xs font-semibold text-orange-600 uppercase tracking-widest border-b border-orange-100 pb-2">
        {titulo}
      </h2>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none w-fit">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-orange-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  )
}
