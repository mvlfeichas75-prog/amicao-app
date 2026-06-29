export function parseFotos(foto_url: string | null): string[] {
  if (!foto_url) return []
  try {
    const parsed = JSON.parse(foto_url)
    return Array.isArray(parsed) ? parsed : [foto_url]
  } catch {
    return [foto_url]
  }
}
