'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function NavBar() {
  const { user, perfil, loading, logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-orange-500 text-white px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold tracking-tight">
        🐾 Amicão
      </Link>

      <div className="flex items-center gap-5 text-sm font-medium">
        <Link href="/animais" className="hover:underline">Adotar</Link>
        <Link href="/animais/novo" className="hover:underline">Anunciar</Link>

        {!loading && (perfil?.nivel ?? 0) >= 3 && (
          <Link href="/admin" className="hover:underline">Admin</Link>
        )}

        {loading ? null : user ? (
          <>
            <span className="text-orange-100 max-w-[160px] truncate">
              {perfil?.nome ?? user.email?.split('@')[0]}
            </span>
            <button
              onClick={handleLogout}
              className="bg-white text-orange-600 font-semibold px-4 py-1.5 rounded-full hover:bg-orange-50 transition"
            >
              Sair
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline">
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="bg-white text-orange-600 font-semibold px-4 py-1.5 rounded-full hover:bg-orange-50 transition"
            >
              Cadastrar
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
