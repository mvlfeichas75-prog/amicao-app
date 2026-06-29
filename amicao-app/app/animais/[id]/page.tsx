import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default async function AnimalPage(props: PageProps<'/animais/[id]'>) {
  const { id } = await props.params

  const { data: animal } = await supabase
    .from('animais')
    .select('*')
    .eq('id', id)
    .single()

  if (!animal) notFound()

  const porteLabel: Record<string, string> = {
    pequeno: 'Pequeno (até 10 kg)',
    medio: 'Médio (10–25 kg)',
    grande: 'Grande (acima de 25 kg)',
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link
        href="/animais"
        className="inline-flex items-center gap-1 text-orange-500 font-medium hover:underline mb-6"
      >
        ← Voltar à listagem
      </Link>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Foto */}
        <div className="relative h-80 bg-orange-50">
          {animal.foto_url ? (
            <Image
              src={animal.foto_url}
              alt={animal.nome}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-8xl">🐶</div>
          )}
          {animal.status === 'adotado' && (
            <div className="absolute top-4 right-4 bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              Adotado
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">{animal.nome}</h1>
            <div className="flex flex-wrap gap-2 shrink-0">
              <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full capitalize">
                {animal.porte}
              </span>
              <span className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-full capitalize">
                {animal.sexo}
              </span>
              {animal.castrado && (
                <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Castrado
                </span>
              )}
            </div>
          </div>

          {/* Informações */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <InfoItem label="Localização" value={`${animal.cidade}, ${animal.estado}`} />
            <InfoItem label="Porte" value={porteLabel[animal.porte] ?? animal.porte} />
            <InfoItem label="Sexo" value={animal.sexo === 'macho' ? 'Macho' : 'Fêmea'} />
            <InfoItem label="Castrado" value={animal.castrado ? 'Sim' : 'Não'} />
            {animal.idade && <InfoItem label="Idade" value={animal.idade} />}
            {animal.raca && <InfoItem label="Raça" value={animal.raca} />}
          </div>

          {/* Descrição */}
          {animal.descricao && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Sobre {animal.nome}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{animal.descricao}</p>
            </div>
          )}

          {/* CTA */}
          {animal.status === 'disponivel' && (
            <div className="bg-orange-50 rounded-xl p-6 text-center">
              <p className="text-gray-600 mb-4">
                Tem interesse em adotar <strong>{animal.nome}</strong>? Entre em contato com o responsável.
              </p>
              {animal.contato ? (
                <a
                  href={`https://wa.me/${animal.contato.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition"
                >
                  Quero adotar
                </a>
              ) : (
                <button
                  disabled
                  className="bg-gray-200 text-gray-400 font-bold px-8 py-3 rounded-full cursor-not-allowed"
                >
                  Contato indisponível
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-gray-800 font-medium capitalize">{value}</p>
    </div>
  )
}
