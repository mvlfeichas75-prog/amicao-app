import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { parseFotos } from '@/lib/fotos'
import { tempoRelativo } from '@/lib/tempo'
import FiltrosBarra, { type Filtros, toUrl } from './FiltrosBarra'

const POR_PAGINA = 12

type SearchParams = {
  estado?: string
  cidade?: string
  porte?: string
  sexo?: string
  castrado?: string
  convive_criancas?: string
  convive_caes?: string
  pagina?: string
}

type Animal = {
  id: string
  nome: string | null
  cidade: string
  estado: string
  porte: string
  sexo: string
  castrado: boolean
  foto_url: string | null
  criado_em: string
}

export default async function AnimaisPage(props: { searchParams: Promise<SearchParams> }) {
  const sp = await props.searchParams

  const filtros: Filtros = {
    estado:           sp.estado           ?? '',
    cidade:           sp.cidade           ?? '',
    porte:            sp.porte            ?? '',
    sexo:             sp.sexo             ?? '',
    castrado:         sp.castrado         ?? '',
    convive_criancas: sp.convive_criancas ?? '',
    convive_caes:     sp.convive_caes     ?? '',
  }

  const pagina = Math.max(1, parseInt(sp.pagina ?? '1', 10) || 1)
  const from = (pagina - 1) * POR_PAGINA
  const to = from + POR_PAGINA - 1

  let query = supabase
    .from('animais')
    .select('id, nome, cidade, estado, porte, sexo, castrado, foto_url, criado_em', { count: 'exact' })
    .eq('status', 'disponivel')
    .order('criado_em', { ascending: false })

  if (filtros.estado)           query = query.eq('estado', filtros.estado)
  if (filtros.cidade)           query = query.ilike('cidade', `%${filtros.cidade}%`)
  if (filtros.porte)            query = query.eq('porte', filtros.porte)
  if (filtros.sexo)             query = query.eq('sexo', filtros.sexo)
  if (filtros.castrado !== '')  query = query.eq('castrado', filtros.castrado === 'sim')
  if (filtros.convive_criancas) query = query.eq('convive_criancas', filtros.convive_criancas)
  if (filtros.convive_caes)     query = query.eq('convive_caes', filtros.convive_caes)

  query = query.range(from, to)

  const { data, count, error } = await query

  if (error) console.error('Supabase error:', error.message)

  const animais: Animal[] = data ?? []
  const total = count ?? 0
  const totalPaginas = Math.ceil(total / POR_PAGINA)
  const temFiltroAtivo = Object.values(filtros).some(Boolean)

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cães disponíveis</h1>
          <p className="text-gray-500 mt-1">
            {total} {total === 1 ? 'animal encontrado' : 'animais encontrados'}
            {temFiltroAtivo && ' com esses filtros'}
          </p>
        </div>
        <Link
          href="/animais/novo"
          className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600 transition"
        >
          + Anunciar cão
        </Link>
      </div>

      {/* Barra de filtros — key força re-mount ao navegar */}
      <FiltrosBarra key={JSON.stringify(filtros)} filtros={filtros} />

      {/* Conteúdo */}
      {animais.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">{temFiltroAtivo ? '🔍' : '🐾'}</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {temFiltroAtivo
              ? 'Nenhum cão encontrado com esses filtros'
              : 'Nenhum cão disponível no momento'}
          </h2>
          <p className="text-gray-400 mb-6">
            {temFiltroAtivo ? (
              <>
                Tente remover alguns filtros ou{' '}
                <Link href="/animais" className="text-orange-500 hover:underline">
                  limpar a busca
                </Link>
                .
              </>
            ) : (
              'Encontrou um cão abandonado? Seja o primeiro a anunciar!'
            )}
          </p>
          {!temFiltroAtivo && (
            <Link
              href="/animais/novo"
              className="bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition"
            >
              Anunciar agora
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {animais.map((animal) => {
              const fotoCard = parseFotos(animal.foto_url)[0]
              return (
                <Link key={animal.id} href={`/animais/${animal.id}`}>
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition">
                    <div className="relative h-52 bg-orange-50">
                      {fotoCard ? (
                        <Image
                          src={fotoCard}
                          alt={animal.nome ?? 'Foto do animal'}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-5xl">🐶</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h2 className="text-lg font-bold text-gray-800 mb-1">
                        {animal.nome ?? 'Sem nome'}
                      </h2>
                      <p className="text-sm text-gray-500 mb-3">
                        {animal.cidade}, {animal.estado}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full capitalize">
                          {animal.porte}
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full capitalize">
                          {animal.sexo}
                        </span>
                        {animal.castrado && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            Castrado
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Publicado {tempoRelativo(animal.criado_em)}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Paginação */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10">
              {pagina > 1 ? (
                <Link
                  href={toUrl(filtros, pagina - 1)}
                  className="px-5 py-2 rounded-full bg-white shadow-sm text-gray-700 font-medium hover:shadow-md transition"
                >
                  ← Anterior
                </Link>
              ) : (
                <span className="px-5 py-2 rounded-full bg-gray-100 text-gray-300 font-medium">
                  ← Anterior
                </span>
              )}

              <span className="text-sm text-gray-500">
                Página {pagina} de {totalPaginas}
              </span>

              {pagina < totalPaginas ? (
                <Link
                  href={toUrl(filtros, pagina + 1)}
                  className="px-5 py-2 rounded-full bg-white shadow-sm text-gray-700 font-medium hover:shadow-md transition"
                >
                  Próxima →
                </Link>
              ) : (
                <span className="px-5 py-2 rounded-full bg-gray-100 text-gray-300 font-medium">
                  Próxima →
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
