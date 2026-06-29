'use client'

import { useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

const BUCKET = 'animais'

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
  const nomeAlt = nome ?? 'Animal'

  async function handleRemoverFoto(index: number) {
    if (!confirm(`Remover a foto ${index + 1}? Esta ação não pode ser desfeita.`)) return

    setRemovendo(index)

    const url = fotos[index]
    const path = extrairPath(url)

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

  if (fotos.length === 0) {
    return (
      <div className="relative h-80 bg-orange-50 flex items-center justify-center text-8xl">
        🐶
        {adotado && <BadgeAdotado />}
      </div>
    )
  }

  return (
    <>
      {/* Foto principal */}
      <div className="relative h-80 bg-orange-50 group">
        <Image
          src={fotos[ativa]}
          alt={`${nomeAlt} — foto ${ativa + 1}`}
          fill
          className="object-cover"
          priority
        />
        {adotado && <BadgeAdotado />}
        {fotos.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {ativa + 1}/{fotos.length}
          </div>
        )}
        {/* Botão de remoção na foto principal */}
        <button
          type="button"
          onClick={() => handleRemoverFoto(ativa)}
          disabled={removendo !== null}
          className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600/80 disabled:cursor-not-allowed"
          aria-label="Remover esta foto"
        >
          {removendo === ativa ? 'Removendo…' : '× Remover foto'}
        </button>
      </div>

      {/* Strip de miniaturas */}
      {fotos.length > 1 && (
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
              {/* X de remoção na miniatura */}
              <button
                type="button"
                onClick={() => handleRemoverFoto(i)}
                disabled={removendo !== null}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs leading-none flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition hover:bg-red-600 disabled:cursor-not-allowed"
                aria-label={`Remover foto ${i + 1}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function BadgeAdotado() {
  return (
    <div className="absolute top-4 right-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
      Adotado
    </div>
  )
}
