'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { parseFotos } from '@/lib/fotos'

type StatusAnimal = 'disponivel' | 'em_triagem' | 'adotado' | 'sumiu'

const STATUS_OPTS: { value: StatusAnimal; label: string; cor: string }[] = [
  { value: 'disponivel', label: 'Disponível',  cor: 'text-green-700  bg-green-50  border-green-200'  },
  { value: 'em_triagem', label: 'Em triagem',  cor: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  { value: 'adotado',    label: 'Adotado',     cor: 'text-blue-700   bg-blue-50   border-blue-200'   },
  { value: 'sumiu',      label: 'Sumiu',       cor: 'text-red-700    bg-red-50    border-red-200'     },
]

function corDoStatus(status: string) {
  return STATUS_OPTS.find(o => o.value === status)?.cor ?? 'text-gray-600 bg-gray-50 border-gray-200'
}

interface Animal {
  id: string
  nome: string | null
  foto_url: string | null
  cidade: string
  estado: string
  status: string
  criado_em: string
}

export default function GestaoAnimais() {
  const [animais, setAnimais] = useState<Animal[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    const { data } = await supabase
      .from('animais')
      .select('id, nome, foto_url, cidade, estado, status, criado_em')
      .order('criado_em', { ascending: false })
    setAnimais(data ?? [])
    setCarregando(false)
  }

  async function alterarStatus(id: string, novoStatus: StatusAnimal) {
    setSalvando(id)
    const { error } = await supabase.from('animais').update({ status: novoStatus }).eq('id', id)
    if (error) {
      alert(`Erro: ${error.message}`)
    } else {
      setAnimais(prev => prev.map(a => a.id === id ? { ...a, status: novoStatus } : a))
    }
    setSalvando(null)
  }

  async function remover(id: string, nome: string | null) {
    if (!confirm(`Remover "${nome ?? 'animal'}" permanentemente?`)) return
    setRemovendo(id)
    const { error } = await supabase.from('animais').delete().eq('id', id)
    if (error) {
      alert(`Erro: ${error.message}`)
      setRemovendo(null)
    } else {
      setAnimais(prev => prev.filter(a => a.id !== id))
      setRemovendo(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestão de Animais</h1>
      {carregando ? (
        <p className="text-gray-400">Carregando…</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left w-16">Foto</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Localização</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Cadastro</th>
                <th className="px-4 py-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {animais.map(a => {
                const thumb = parseFotos(a.foto_url)[0]
                return (
                  <tr key={a.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt={a.nome ?? ''}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                          ?
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {a.nome ?? <span className="text-gray-400 italic">Sem nome</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{a.cidade}, {a.estado}</td>
                    <td className="px-4 py-3">
                      <select
                        value={a.status}
                        disabled={salvando === a.id}
                        onChange={e => alterarStatus(a.id, e.target.value as StatusAnimal)}
                        className={`rounded-lg border px-2 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-60 ${corDoStatus(a.status)}`}
                      >
                        {STATUS_OPTS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(a.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => remover(a.id, a.nome)}
                        disabled={removendo === a.id}
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition disabled:opacity-50"
                      >
                        {removendo === a.id ? 'Removendo…' : 'Remover'}
                      </button>
                    </td>
                  </tr>
                )
              })}
              {animais.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Nenhum animal cadastrado.
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
