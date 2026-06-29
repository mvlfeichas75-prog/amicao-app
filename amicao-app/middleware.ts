import { NextRequest, NextResponse } from 'next/server'

// Auth do painel /admin é gerenciada pela própria page (senha via ADMIN_PASSWORD).
// Rotas de usuário (/login, /cadastro) não exigem middleware por enquanto.
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
