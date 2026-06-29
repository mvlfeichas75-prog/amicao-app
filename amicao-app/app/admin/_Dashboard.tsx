'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Metricas {
  totalAnimais: number
  disponiveis: number
  adotados: number
  totalUsuarios: number
  totalInteresses: number
}

export default function Dashboard() {
  const [m, setM] = useState<Metricas | null>(null)

  useEffect(() => {
    async function carregar() {
      const [
        { count: totalAnimais },
        { count: disponiveis },
        { count: adotados },
        { count: totalUsuarios },
        { count: totalInteresses },
      ] = await Promise.all([
        supabase.from('animais').select('*', { count: 'exact', head: true }),
        supabase.from('animais').select('*', { count: 'exact', head: true }).eq('status', 'disponivel'),
        supabase.from('animais').select('*', { count: 'exact', head: true }).eq('status', 'adotado'),
        supabase.from('usuarios').select('*', { count: 'exact', head: true }),
        supabase.from('adocoes').select('*', { count: 'exact', head: true }),
      ])
      setM({
        totalAnimais:    totalAnimais    ?? 0,
        disponiveis:     disponiveis     ?? 0,
        adotados:        adotados        ?? 0,
        totalUsuarios:   totalUsuarios   ?? 0,
        totalInteresses: totalInteresses ?? 0,
      })
    }
    carregar()
  }, [])

  const cards = m ? [
    { label: 'Total de animais',    valor: m.totalAnimais,    cor: 'text-orange-600', bg: 'bg-orange-50'  },
    { label: 'Disponíveis',         valor: m.disponiveis,     cor: 'text-green-600',  bg: 'bg-green-50'   },
    { label: 'Adotados',            valor: m.adotados,        cor: 'text-blue-600',   bg: 'bg-blue-50'    },
    { label: 'Usuários cadastrados', valor: m.totalUsuarios,  cor: 'text-purple-600', bg: 'bg-purple-50'  },
    { label: 'Interesses recebidos', valor: m.totalInteresses, cor: 'text-rose-600',  bg: 'bg-rose-50'    },
  ] : []

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {!m ? (
        <p className="text-gray-400">Carregando métricas…</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {cards.map(c => (
            <div key={c.label} className={`${c.bg} rounded-2xl p-5`}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{c.label}</p>
              <p className={`text-4xl font-bold ${c.cor}`}>{c.valor}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
