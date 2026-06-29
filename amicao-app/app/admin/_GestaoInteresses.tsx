'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Interesse {
  id: string
  nome_interessado: string | null
  email_interessado: string | null
  telefone_interessado: string | null
  observacoes: string | null
  status: string
  criado_em: string | null
  animais: { nome: string | null }[] | null
}

export default function GestaoInteresses() {
  const [interesses, setInteresses] = useState<Interesse[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('adocoes')
        .select('id, nome_interessado, email_interessado, telefone_interessado, observacoes, status, criado_em, animais(nome)')
        .order('criado_em', { ascending: false })
      setInteresses((data as unknown as Interesse[]) ?? [])
      setCarregando(false)
    }
    carregar()
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Interesses</h1>
      {carregando ? (
        <p className="text-gray-400">Carregando…</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Animal</th>
                <th className="px-4 py-3 text-left">Interessado</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Telefone</th>
                <th className="px-4 py-3 text-left">Motivo</th>
                <th className="px-4 py-3 text-left">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {interesses.map(i => (
                <tr key={i.id} className="hover:bg-gray-50 transition align-top">
                  <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                    {i.animais?.[0]?.nome ?? <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                    {i.nome_interessado ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {i.email_interessado
                      ? <a href={`mailto:${i.email_interessado}`} className="text-orange-500 hover:underline">{i.email_interessado}</a>
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {i.telefone_interessado ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs">
                    <p className="line-clamp-2">{i.observacoes ?? '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {i.criado_em ? new Date(i.criado_em).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
              {interesses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Nenhum interesse registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
