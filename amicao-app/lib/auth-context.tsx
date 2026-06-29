'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface Perfil {
  id: string
  nome: string
  email: string
  telefone: string | null
  cidade: string
  estado: string
  tipo_perfil: string
  nivel: number
  verificado: boolean
  ativo: boolean
}

interface CadastroData {
  nome: string
  email: string
  senha: string
  telefone: string
  cidade: string
  estado: string
  tipo_perfil: string
}

interface AuthContextType {
  user: User | null
  perfil: Perfil | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => Promise<void>
  cadastrar: (dados: CadastroData) => Promise<{ requiresEmailConfirmation: boolean }>
}

const AuthContext = createContext<AuthContextType | null>(null)

async function buscarPerfil(userId: string): Promise<Perfil | null> {
  const { data } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single()
  return data ?? null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        buscarPerfil(session.user.id).then(setPerfil)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        buscarPerfil(session.user.id).then(setPerfil)
      } else {
        setPerfil(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function login(email: string, senha: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) throw new Error(error.message)
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function cadastrar(dados: CadastroData) {
    const { data, error } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: { data: { nome: dados.nome, nivel: 2 } },
    })
    if (error) throw new Error(error.message)
    if (!data.user) throw new Error('Usuário não criado.')

    const { error: dbError } = await supabase.from('usuarios').insert({
      id: data.user.id,
      nome: dados.nome,
      email: dados.email,
      telefone: dados.telefone || null,
      cidade: dados.cidade,
      estado: dados.estado,
      tipo_perfil: dados.tipo_perfil,
      nivel: 2,
      verificado: false,
      ativo: true,
    })
    if (dbError) throw new Error(dbError.message)

    return { requiresEmailConfirmation: !data.session }
  }

  return (
    <AuthContext.Provider value={{ user, perfil, loading, login, logout, cadastrar }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
