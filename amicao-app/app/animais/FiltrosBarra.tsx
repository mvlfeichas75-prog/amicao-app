'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]

export type Filtros = {
  estado: string
  cidade: string
  porte: string
  sexo: string
  castrado: string
  convive_criancas: string
  convive_caes: string
}

export function toUrl(filtros: Filtros, pagina?: number): string {
  const params = new URLSearchParams()
  Object.entries(filtros).forEach(([k, v]) => { if (v) params.set(k, v) })
  if (pagina && pagina > 1) params.set('pagina', String(pagina))
  const qs = params.toString()
  return `/animais${qs ? `?${qs}` : ''}`
}

const select = 'h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300'

export default function FiltrosBarra({ filtros: inicial }: { filtros: Filtros }) {
  const router = useRouter()
  const [filtros, setFiltros] = useState(inicial)

  function pushSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const novo = { ...filtros, [e.target.name]: e.target.value }
    setFiltros(novo)
    router.push(toUrl(novo))
  }

  function pushCidade(e: React.FormEvent) {
    e.preventDefault()
    router.push(toUrl(filtros))
  }

  function limpar() {
    const vazio: Filtros = {
      estado: '', cidade: '', porte: '', sexo: '',
      castrado: '', convive_criancas: '', convive_caes: '',
    }
    setFiltros(vazio)
    router.push('/animais')
  }

  const temFiltro = Object.values(filtros).some(Boolean)

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
      <form onSubmit={pushCidade}>
        <div className="flex flex-wrap gap-3 items-end">

          {/* Estado */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Estado</label>
            <select name="estado" value={filtros.estado} onChange={pushSelect} className={select}>
              <option value="">Todos</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          {/* Cidade */}
          <div className="flex flex-col gap-1 flex-1 min-w-44">
            <label className="text-xs text-gray-400 font-medium">Cidade</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                name="cidade"
                value={filtros.cidade}
                onChange={e => setFiltros(f => ({ ...f, cidade: e.target.value }))}
                placeholder="Buscar cidade…"
                className="h-9 flex-1 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                type="submit"
                className="h-9 px-3 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 transition"
              >
                OK
              </button>
            </div>
          </div>

          {/* Porte */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Porte</label>
            <select name="porte" value={filtros.porte} onChange={pushSelect} className={select}>
              <option value="">Todos</option>
              <option value="pequeno">Pequeno</option>
              <option value="medio">Médio</option>
              <option value="grande">Grande</option>
            </select>
          </div>

          {/* Sexo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Sexo</label>
            <select name="sexo" value={filtros.sexo} onChange={pushSelect} className={select}>
              <option value="">Todos</option>
              <option value="macho">Macho</option>
              <option value="femea">Fêmea</option>
            </select>
          </div>

          {/* Castrado */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Castrado</label>
            <select name="castrado" value={filtros.castrado} onChange={pushSelect} className={select}>
              <option value="">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </div>

          {/* Convive com crianças */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Com crianças</label>
            <select name="convive_criancas" value={filtros.convive_criancas} onChange={pushSelect} className={select}>
              <option value="">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
              <option value="nao_testado">Não testado</option>
            </select>
          </div>

          {/* Convive com cães */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Com cães</label>
            <select name="convive_caes" value={filtros.convive_caes} onChange={pushSelect} className={select}>
              <option value="">Todos</option>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
              <option value="nao_testado">Não testado</option>
            </select>
          </div>

          {/* Limpar */}
          {temFiltro && (
            <button
              type="button"
              onClick={limpar}
              className="h-9 px-4 text-sm text-orange-500 border border-orange-200 rounded-lg hover:bg-orange-50 transition self-end"
            >
              Limpar
            </button>
          )}

        </div>
      </form>
    </div>
  )
}
