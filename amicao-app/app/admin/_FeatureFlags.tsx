'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const FLAGS = [
  { chave: 'feature_cadastro_animal', label: 'Cadastro de animais',     descricao: 'Permite que usuários cadastrem novos animais na plataforma' },
  { chave: 'feature_interesse',       label: 'Formulário de interesse',  descricao: 'Exibe o botão "Tenho interesse" na página de cada animal'   },
  { chave: 'feature_filtros',         label: 'Filtros na listagem',      descricao: 'Exibe painel de filtros de busca na listagem de animais'     },
  { chave: 'feature_galeria_fotos',   label: 'Galeria de fotos',         descricao: 'Permite upload e visualização de múltiplas fotos por animal' },
  { chave: 'feature_reenvio_codigo',  label: 'Reenvio de código',        descricao: 'Permite reenviar o código de gerenciamento por email'        },
]

export default function FeatureFlags() {
  const [valores, setValores] = useState<Record<string, boolean>>({})
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState<string | null>(null)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from('configuracoes')
        .select('chave, valor')
        .in('chave', FLAGS.map(f => f.chave))
      const mapa: Record<string, boolean> = {}
      FLAGS.forEach(f => { mapa[f.chave] = true }) // padrão: ativo
      ;(data ?? []).forEach(row => { mapa[row.chave] = row.valor === 'true' })
      setValores(mapa)
      setCarregando(false)
    }
    carregar()
  }, [])

  async function toggle(chave: string) {
    const novoValor = !valores[chave]
    setSalvando(chave)
    const { error } = await supabase
      .from('configuracoes')
      .upsert({ chave, valor: String(novoValor), atualizado_em: new Date().toISOString() })
    if (error) {
      alert(`Erro ao salvar: ${error.message}`)
    } else {
      setValores(prev => ({ ...prev, [chave]: novoValor }))
    }
    setSalvando(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Feature Flags</h1>
      <p className="text-sm text-gray-400 mb-6">Ative ou desative módulos do sistema sem deploy.</p>
      {carregando ? (
        <p className="text-gray-400">Carregando…</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-50">
          {FLAGS.map(f => {
            const ativo = valores[f.chave] ?? true
            const salvandoEste = salvando === f.chave
            return (
              <div key={f.chave} className="flex items-center justify-between px-6 py-4 gap-4">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{f.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.descricao}</p>
                  <code className="text-xs text-gray-300 mt-1 block">{f.chave}</code>
                </div>
                <button
                  onClick={() => toggle(f.chave)}
                  disabled={salvandoEste}
                  aria-checked={ativo}
                  role="switch"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 ${
                    ativo ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                      ativo ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
