'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [modoReset, setModoReset] = useState(false)
  const [emailReset, setEmailReset] = useState('')
  const [enviandoReset, setEnviandoReset] = useState(false)
  const [resetEnviado, setResetEnviado] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setLoading(true)
    try {
      await login(email, senha)
      router.push('/animais')
      router.refresh()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Verifique seu email e senha e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setEnviandoReset(true)
    try {
      await supabase.auth.resetPasswordForEmail(emailReset, {
        redirectTo: `${window.location.origin}/login`,
      })
      setResetEnviado(true)
    } finally {
      setEnviandoReset(false)
    }
  }

  if (modoReset) {
    return (
      <div className="max-w-md mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Recuperar senha</h1>
          <p className="text-gray-500">
            <button
              onClick={() => { setModoReset(false); setResetEnviado(false) }}
              className="text-orange-500 font-medium hover:underline"
            >
              ← Voltar ao login
            </button>
          </p>
        </div>

        {resetEnviado ? (
          <div className="bg-green-50 text-green-700 rounded-2xl p-6 text-center space-y-1">
            <p className="font-medium">Email enviado!</p>
            <p className="text-sm">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="bg-white rounded-2xl shadow-sm p-8 space-y-5">
            <p className="text-sm text-gray-500">
              Informe o email cadastrado e enviaremos um link para redefinir sua senha.
            </p>
            <Field label="Email">
              <input
                type="email"
                value={emailReset}
                onChange={e => setEmailReset(e.target.value)}
                placeholder="voce@email.com"
                required
                autoFocus
                className={inputClass}
              />
            </Field>
            <button
              type="submit"
              disabled={enviandoReset}
              className="w-full bg-orange-500 text-white font-bold py-3 rounded-full hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {enviandoReset ? 'Enviando…' : 'Enviar link de recuperação'}
            </button>
          </form>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Entrar</h1>
        <p className="text-gray-500">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-orange-500 font-medium hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>

      <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-sm p-8 space-y-5">
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="voce@email.com"
            required
            autoFocus
            className={inputClass}
          />
        </Field>

        <Field label="Senha">
          <input
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            placeholder="Sua senha"
            required
            className={inputClass}
          />
        </Field>

        <div className="text-right -mt-2">
          <button
            type="button"
            onClick={() => setModoReset(true)}
            className="text-xs text-gray-400 hover:text-orange-500 hover:underline transition"
          >
            Esqueci minha senha
          </button>
        </div>

        {erro && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{erro}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-full hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
