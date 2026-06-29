'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  fotos: string[]
  nome: string | null
  adotado: boolean
}

export default function GaleriaFotos({ fotos, nome, adotado }: Props) {
  const [ativa, setAtiva] = useState(0)
  const nomeAlt = nome ?? 'Animal'

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
      <div className="relative h-80 bg-orange-50">
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
      </div>

      {/* Strip de miniaturas */}
      {fotos.length > 1 && (
        <div className="flex gap-2 px-3 py-3 overflow-x-auto bg-gray-50 border-b border-gray-100">
          {fotos.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setAtiva(i)}
              className={`relative w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                i === ativa ? 'border-orange-400' : 'border-transparent hover:border-orange-200'
              }`}
              aria-label={`Ver foto ${i + 1}`}
              aria-pressed={i === ativa}
            >
              <Image
                src={url}
                alt={`${nomeAlt} — foto ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
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
