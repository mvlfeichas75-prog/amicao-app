'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const ESTADOS_BR = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

export default function CadastroPage() {
  const router = useRouter()
  const { cadastrar } = useAuth()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [telefone, setTelefone] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('SP')
  const [tipoPerfil, setTipoPerfil] = useState('adotante')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [emailConfirmacao, setEmailConfirmacao] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const { requiresEmailConfirmation } = await cadastrar({
        nome, email, senha, telefone, cidade, estado, tipo_perfil: tipoPerfil,
      })
      if (requiresEmailConfirmation) {
        setEmailConfirmacao(email)
      } else {
        router.push('/animais')
        router.refresh()
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (emailConfirmacao) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Confirme seu email</h1>
        <p className="text-gray-500 mb-6">
          Enviamos um link de confirmação para <strong>{emailConfirmacao}</strong>.
          Acesse seu email e clique no link para ativar sua conta.
        </p>
        <Link href="/login" className="text-orange-500 font-medium hover:underline">
          Ir para o login
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Criar conta</h1>
        <p className="text-gray-500">
          Já tem conta?{' '}
          <Link href="/login" className="text-orange-500 font-medium hover:underline">
            Entrar
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-5">
        <Field label="Nome completo *">
          <input type="text" value={nome} onChange={e => setNome(e.target.value)}
            placeholder="Seu nome" required className={inputClass} />
        </Field>

        <Field label="Email *">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="voce@email.com" required className={inputClass} />
        </Field>

        <Field label="Senha *">
          <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres" required minLength={6} className={inputClass} />
        </Field>

        <Field label="Confirmar senha *">
          <input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)}
            placeholder="Repita a senha" required className={inputClass} />
        </Field>

        <Field label="Telefone (opcional)">
          <input type="tel" value={telefone} onChange={e => setTelefone(e.target.value)}
            placeholder="(11) 99999-9999" className={inputClass} />
        </Field>

        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <Field label="Cidade *">
              <input type="text" value={cidade} onChange={e => setCidade(e.target.value)}
                placeholder="Sua cidade" required className={inputClass} />
            </Field>
          </div>
          <Field label="Estado">
            <select value={estado} onChange={e => setEstado(e.target.value)} className={inputClass}>
              {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Tipo de perfil *">
          <select value={tipoPerfil} onChange={e => setTipoPerfil(e.target.value)} className={inputClass}>
            <option value="adotante">Adotante</option>
            <option value="resgatador">Resgatador</option>
            <option value="ong">ONG</option>
            <option value="parceiro">Parceiro</option>
          </select>
        </Field>

        {erro && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3">{erro}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white font-bold py-3 rounded-full hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando conta…' : 'Criar conta'}
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
