import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { senha } = await req.json()
  if (!senha || senha !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 })
  }
  return NextResponse.json({ ok: true })
}
