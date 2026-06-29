import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { parseFotos } from '@/lib/fotos'

type Animal = {
  id: string
  nome: string
  cidade: string
  estado: string
  porte: string
  sexo: string
  castrado: boolean
  foto_url: string | null
  criado_em: string
}

export default async function AnimaisPage() {
  const { data, error } = await supabase
    .from('animais')
    .select('id, nome, cidade, estado, porte, sexo, castrado, foto_url, criado_em')
    .eq('status', 'disponivel')
    .order('criado_em', { ascending: false })

  if (error) console.error('Supabase error:', error.message)

  const animais: Animal[] = data ?? []

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Cães disponíveis</h1>
          <p className="text-gray-500 mt-1">
            {animais.length} {animais.length === 1 ? 'animal encontrado' : 'animais encontrados'}
          </p>
        </div>
        <Link
          href="/animais/novo"
          className="bg-orange-500 text-white font-bold px-6 py-3 rounded-full hover:bg-orange-600 transition"
        >
          + Anunciar cão
        </Link>
      </div>

      {animais.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🐾</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Nenhum cão disponível no momento
          </h2>
          <p className="text-gray-400 mb-6">
            Encontrou um cão abandonado? Seja o primeiro a anunciar!
          </p>
          <Link
            href="/animais/novo"
            className="bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition"
          >
            Anunciar agora
          </Link>
        </div>
      ) : (
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
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl">🐶</div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold text-gray-800 mb-1">{animal.nome}</h2>
                  <p className="text-sm text-gray-500 mb-3">
                    {animal.cidade}, {animal.estado}
                  </p>
                  <div className="flex flex-wrap gap-2">
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
                </div>
              </div>
            </Link>
          )})}
        </div>
      )}
    </div>
  )
}
