'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

export default function NovoAnimalPage() {
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [idade, setIdade] = useState('')
  const [porte, setPorte] = useState<'pequeno' | 'medio' | 'grande'>('medio')
  const [sexo, setSexo] = useState<'macho' | 'femea' | 'desconhecido'>('desconhecido')
  const [castrado, setCastrado] = useState(false)
  const [vacinado, setVacinado] = useState(false)
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('SP')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setFoto(file)
    if (file) {
      setFotoPreview(URL.createObjectURL(file))
    } else {
      setFotoPreview(null)
    }
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
      let foto_url: string | null = null

      if (foto) {
        const ext = foto.name.split('.').pop()
        const path = `animais/${Date.now()}.${ext}`

        const { data: upload, error: uploadErro } = await supabase.storage
          .from('fotos')
          .upload(path, foto, { upsert: false })

        if (uploadErro) throw new Error(`Upload falhou: ${uploadErro.message}`)

        const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(upload.path)
        foto_url = urlData.publicUrl
      }

      const { error: insertErro } = await supabase.from('animais').insert({
        nome: nome.trim() || null,
        descricao: descricao.trim() || null,
        idade: idade.trim() || null,
        porte,
        sexo,
        castrado,
        vacinado,
        cidade: cidade.trim(),
        estado,
        foto_url,
        status: 'disponivel',
      })

      if (insertErro) throw new Error(insertErro.message)

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

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">

        {/* Foto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Foto</label>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-xl bg-orange-50 flex items-center justify-center overflow-hidden shrink-0">
              {fotoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl">🐶</span>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="block text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 cursor-pointer"
              />
              <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WEBP. Opcional.</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Nome */}
        <Field label="Nome do animal (opcional)">
          <input
            type="text"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Ex: Bob, Rex…"
            className={inputClass}
          />
        </Field>

        {/* Descrição */}
        <Field label="Descrição">
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            rows={3}
            placeholder="Conte sobre o comportamento, onde foi encontrado, saúde…"
            className={`${inputClass} resize-none`}
          />
        </Field>

        {/* Idade */}
        <Field label="Idade estimada">
          <input
            type="text"
            value={idade}
            onChange={e => setIdade(e.target.value)}
            placeholder="Ex: 2 anos, 6 meses, filhote…"
            className={inputClass}
          />
        </Field>

        {/* Porte + Sexo */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Porte">
            <select
              value={porte}
              onChange={e => setPorte(e.target.value as typeof porte)}
              className={inputClass}
            >
              <option value="pequeno">Pequeno (até 10 kg)</option>
              <option value="medio">Médio (10–25 kg)</option>
              <option value="grande">Grande (acima de 25 kg)</option>
            </select>
          </Field>

          <Field label="Sexo">
            <select
              value={sexo}
              onChange={e => setSexo(e.target.value as typeof sexo)}
              className={inputClass}
            >
              <option value="macho">Macho</option>
              <option value="femea">Fêmea</option>
              <option value="desconhecido">Desconhecido</option>
            </select>
          </Field>
        </div>

        {/* Checkboxes */}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={castrado}
              onChange={e => setCastrado(e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-sm text-gray-700">Castrado</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={vacinado}
              onChange={e => setVacinado(e.target.checked)}
              className="w-4 h-4 accent-orange-500"
            />
            <span className="text-sm text-gray-700">Vacinado</span>
          </label>
        </div>

        <hr className="border-gray-100" />

        {/* Cidade + Estado */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <Field label="Cidade *">
              <input
                type="text"
                value={cidade}
                onChange={e => setCidade(e.target.value)}
                placeholder="Ex: São Paulo"
                required
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Estado">
            <select
              value={estado}
              onChange={e => setEstado(e.target.value)}
              className={inputClass}
            >
              {ESTADOS_BR.map(uf => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">
            {erro}
          </div>
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

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
