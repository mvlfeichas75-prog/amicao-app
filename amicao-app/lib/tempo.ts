export function tempoRelativo(dataStr: string): string {
  const diff = Date.now() - new Date(dataStr).getTime()
  const m  = Math.floor(diff / 60_000)
  const h  = Math.floor(diff / 3_600_000)
  const d  = Math.floor(diff / 86_400_000)
  const s  = Math.floor(d / 7)
  const me = Math.floor(d / 30)

  if (m  < 1)  return 'agora mesmo'
  if (h  < 1)  return `há ${m} minuto${m  !== 1 ? 's' : ''}`
  if (d  < 1)  return `há ${h} hora${h   !== 1 ? 's' : ''}`
  if (d  < 7)  return `há ${d} dia${d    !== 1 ? 's' : ''}`
  if (s  < 5)  return `há ${s} semana${s !== 1 ? 's' : ''}`
  return `há ${me} mês`
}
