'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

const BUCKET = 'animais'
const MAX_FOTOS = 5

function extrairPath(url: string): string {
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  return idx >= 0 ? url.slice(idx + marker.length) : ''
}

interface Props {
  fotos: string[]
  nome: string | null
  adotado: boolean
  animalId: string
}

export default function GaleriaFotos({ fotos: fotosProp, nome, adotado, animalId }: Props) {
  const [fotos, setFotos] = useState(fotosProp)
  const [ativa, setAtiva] = useState(0)
  const [removendo, setRemovendo] = useState<number | null>(null)
  const [subindo, setSubindo] = useState(false)
  const [erroUpload, setErroUpload] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const nomeAlt = nome ?? 'Animal'

  const vagas = MAX_FOTOS - fotos.length
  const podeAdicionar = vagas > 0

  async function handleAdicionarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivos = Array.from(e.target.files ?? []).slice(0, vagas)
    e.target.value = ''
    if (arquivos.length === 0) return

    setSubindo(true)
    setErroUpload(null)

    try {
      const novasUrls: string[] = []

      for (const arquivo of arquivos) {
        const ext = arquivo.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { data: upload, error: uploadErro } = await supabase.storage
          .from(BUCKET)
          .upload(path, arquivo, { upsert: false })

        if (uploadErro) throw new Error(`Upload falhou: ${uploadErro.message}`)

        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(upload.path)
        novasUrls.push(urlData.publicUrl)
      }

      const fotosAtualizadas = [...fotos, ...novasUrls]

      const { error: dbErro } = await supabase
        .from('animais')
        .update({ foto_url: JSON.stringify(fotosAtualizadas) })
        .eq('id', animalId)

      if (dbErro) throw new Error(`Erro ao salvar no banco: ${dbErro.message}`)

      setFotos(fotosAtualizadas)
      setAtiva(fotos.length) // abre a primeira foto recém-adicionada
    } catch (err) {
      setErroUpload(err instanceof Error ? err.message : 'Erro ao fazer upload.')
    } finally {
      setSubindo(false)
    }
  }

  async function handleRemoverFoto(index: number) {
    if (!confirm(`Remover a foto ${index + 1}? Esta ação não pode ser desfeita.`)) return

    setRemovendo(index)

    const path = extrairPath(fotos[index])

    if (path) {
      const { error: storageErro } = await supabase.storage.from(BUCKET).remove([path])
      if (storageErro) {
        alert(`Erro ao remover do Storage: ${storageErro.message}`)
        setRemovendo(null)
        return
      }
    }

    const novasFotos = fotos.filter((_, i) => i !== index)

    const { error: dbErro } = await supabase
      .from('animais')
      .update({ foto_url: novasFotos.length > 0 ? JSON.stringify(novasFotos) : null })
      .eq('id', animalId)

    if (dbErro) {
      alert(`Erro ao atualizar o banco: ${dbErro.message}`)
      setRemovendo(null)
      return
    }

    setFotos(novasFotos)
    setAtiva(prev => Math.min(prev, Math.max(0, novasFotos.length - 1)))
    setRemovendo(null)
  }

  return (
    <>
      {/* Foto principal / estado vazio */}
      <div className="relative h-80 bg-orange-50 group">
        {fotos.length > 0 ? (
          <>
            <Image
              src={fotos[ativa]}
              alt={`${nomeAlt} — foto ${ativa + 1}`}
              fill
              className="object-cover"
              priority
            />
            {fotos.length > 1 && (
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {ativa + 1}/{fotos.length}
              </div>
            )}
            <button
              type="button"
              onClick={() => handleRemoverFoto(ativa)}
              disabled={removendo !== null || subindo}
              className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600/80 disabled:cursor-not-allowed"
              aria-label="Remover esta foto"
            >
              {removendo === ativa ? 'Removendo…' : '× Remover foto'}
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <span className="text-7xl">🐶</span>
            <BotaoAdicionar onClick={() => inputRef.current?.click()} subindo={subindo} />
          </div>
        )}
        {adotado && <BadgeAdotado />}
      </div>

      {/* Strip de miniaturas + botão de adicionar */}
      {(fotos.length > 1 || (fotos.length === 1 && podeAdicionar)) && (
        <div className="flex gap-2 px-3 py-3 overflow-x-auto bg-gray-50 border-b border-gray-100">
          {fotos.map((url, i) => (
            <div key={url} className="relative shrink-0 group/thumb">
              <button
                type="button"
                onClick={() => setAtiva(i)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                  i === ativa ? 'border-orange-400' : 'border-transparent hover:border-orange-200'
                }`}
                aria-label={`Ver foto ${i + 1}`}
                aria-pressed={i === ativa}
              >
                <Image src={url} alt={`${nomeAlt} — foto ${i + 1}`} fill className="object-cover" />
                {removendo === i && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs">…</span>
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleRemoverFoto(i)}
                disabled={removendo !== null || subindo}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition hover:bg-red-600 disabled:cursor-not-allowed"
                aria-label={`Remover foto ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}

          {/* Botão de adicionar na strip */}
          {podeAdicionar && (
            <BotaoAdicionarThumb
              onClick={() => inputRef.current?.click()}
              subindo={subindo}
              vagas={vagas}
            />
          )}
        </div>
      )}

      {/* Botão de adicionar quando há exatamente 1 foto (sem strip) */}
      {fotos.length === 1 && !podeAdicionar && null}

      {/* Erro de upload */}
      {erroUpload && (
        <div className="bg-red-50 text-red-600 text-xs px-4 py-2 border-b border-red-100">
          {erroUpload}
        </div>
      )}

      {/* Input oculto */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleAdicionarFotos}
        className="hidden"
        disabled={subindo || !podeAdicionar}
      />
    </>
  )
}

function BotaoAdicionar({ onClick, subindo }: { onClick: () => void; subindo: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={subindo}
      className="flex flex-col items-center gap-1 text-orange-400 hover:text-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-2xl leading-none">{subindo ? '…' : '+'}</span>
      <span className="text-xs font-medium">{subindo ? 'Enviando…' : 'Adicionar fotos'}</span>
    </button>
  )
}

function BotaoAdicionarThumb({ onClick, subindo, vagas }: { onClick: () => void; subindo: boolean; vagas: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={subindo}
      className="w-20 h-20 shrink-0 rounded-lg border-2 border-dashed border-orange-200 bg-orange-50 flex flex-col items-center justify-center gap-1 text-orange-400 hover:border-orange-400 hover:text-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Adicionar fotos"
    >
      <span className="text-xl leading-none">{subindo ? '…' : '+'}</span>
      <span className="text-xs">{subindo ? 'Enviando' : `${vagas} vaga${vagas > 1 ? 's' : ''}`}</span>
    </button>
  )
}

function BadgeAdotado() {
  return (
    <div className="absolute top-4 right-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
      Adotado
    </div>
  )
}
