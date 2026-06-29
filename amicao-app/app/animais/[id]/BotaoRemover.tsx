'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function BotaoRemover({ animalId }: { animalId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRemover() {
    if (!confirm('Tem certeza que deseja remover este anúncio? Esta ação não pode ser desfeita.')) return

    setLoading(true)

    const { error } = await supabase.from('animais').delete().eq('id', animalId)

    if (error) {
      alert(`Erro ao remover o anúncio: ${error.message}`)
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/animais')
  }

  return (
    <button
      onClick={handleRemover}
      disabled={loading}
      className="text-sm text-red-400 hover:text-red-600 font-medium hover:underline transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Removendo…' : 'Remover anúncio'}
    </button>
  )
}
