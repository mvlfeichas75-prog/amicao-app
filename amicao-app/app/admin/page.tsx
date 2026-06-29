'use client'

import { useEffect, useState } from 'react'
import Dashboard from './_Dashboard'
import GestaoAnimais from './_GestaoAnimais'
import GestaoInteresses from './_GestaoInteresses'
import FeatureFlags from './_FeatureFlags'

type Secao = 'dashboard' | 'animais' | 'interesses' | 'flags'

const NAV: { id: Secao; label: string; icon: string }[] = [
  { id: 'dashboard',   label: 'Dashboard',       icon: '▦' },
  { id: 'animais',     label: 'Animais',          icon: '≡' },
  { id: 'interesses',  label: 'Interesses',       icon: '♡' },
  { id: 'flags',       label: 'Feature Flags',    icon: '⚙' },
]

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState<boolean | null>(null)
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [entrando, setEntrando] = useState(false)
  const [secao, setSecao] = useState<Secao>('dashboard')

  useEffect(() => {
    setAutenticado(localStorage.getItem('admin_session') === 'true')
  }, [])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setEntrando(true)
    setErro(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      })
      if (res.ok) {
        localStorage.setItem('admin_session', 'true')
        setAutenticado(true)
      } else {
        const json = await res.json()
        setErro(json.error ?? 'Senha incorreta.')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setEntrando(false)
    }
  }

  function logout() {
    localStorage.removeItem('admin_session')
    setAutenticado(false)
    setSenha('')
  }

  // Aguarda hidratação para evitar flash
  if (autenticado === null) return null

  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-sm w-full max-w-sm p-8 space-y-6">
          <div>
            <span className="text-orange-500 font-bold text-2xl">Amicão</span>
            <h1 className="text-lg font-bold text-gray-800 mt-1">Painel administrativo</h1>
            <p className="text-sm text-gray-400 mt-0.5">Acesso restrito</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Senha"
              required
              autoFocus
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {erro && <p className="text-sm text-red-500">{erro}</p>}
            <button
              type="submit"
              disabled={entrando || !senha}
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-full hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {entrando ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const SECOES: Record<Secao, React.ReactNode> = {
    dashboard:   <Dashboard />,
    animais:     <GestaoAnimais />,
    interesses:  <GestaoInteresses />,
    flags:       <FeatureFlags />,
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar fixa */}
      <aside className="fixed inset-y-0 left-0 w-56 bg-white border-r border-gray-100 flex flex-col z-10">
        <div className="px-6 py-5 border-b border-gray-100 shrink-0">
          <span className="text-orange-500 font-bold text-lg">Amicão</span>
          <p className="text-xs text-gray-400 mt-0.5 font-medium uppercase tracking-wider">Admin</p>
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {NAV.map(item => (
            <button
              key={item.id}
              onClick={() => setSecao(item.id)}
              className={`w-full text-left flex items-center gap-3 px-6 py-3 text-sm font-medium transition ${
                secao === item.id
                  ? 'bg-orange-50 text-orange-600 border-r-2 border-orange-500'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button
            onClick={logout}
            className="text-xs text-gray-400 hover:text-red-500 transition font-medium"
          >
            Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <main className="flex-1 ml-56 p-8 min-h-screen">
        {SECOES[secao]}
      </main>
    </div>
  )
}
