import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import NavBar from './NavBar'

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
        <AuthProvider>
          <NavBar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
          <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
            Amicão © 2026 — Todo cão merece um lar
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
