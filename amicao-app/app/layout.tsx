import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Amicão',
  description: 'Conectando cães abandonados a lares amorosos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <nav className="bg-orange-500 text-white px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            🐾 Amicão
          </Link>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="/animais" className="hover:underline">Adotar</Link>
            <Link href="/animais/novo" className="hover:underline">Anunciar</Link>
            <Link href="/cadastro" className="hover:underline">Cadastrar</Link>
          </div>
        </nav>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
          Amicão © 2026 — Todo cão merece um lar
        </footer>
      </body>
    </html>
  )
}