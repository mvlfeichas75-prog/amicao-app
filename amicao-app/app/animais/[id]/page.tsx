import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { parseFotos } from '@/lib/fotos'
import GaleriaFotos from './GaleriaFotos'

const PORTE_LABEL: Record<string, string> = {
  pequeno: 'Pequeno (até 10 kg)',
  medio: 'Médio (10–25 kg)',
  grande: 'Grande (acima de 25 kg)',
}

const CONVIVENCIA_LABEL: Record<string, string> = {
  sim: 'Sim',
  nao: 'Não',
  nao_testado: 'Não testado',
}

const ALIMENTACAO_LABEL: Record<string, string> = {
  racao: 'Ração',
  caseira: 'Comida caseira',
  misto: 'Misto',
}

export default async function AnimalPage(props: PageProps<'/animais/[id]'>) {
  const { id } = await props.params

  const { data: animal } = await supabase
    .from('animais')
    .select('*')
    .eq('id', id)
    .single()

  if (!animal) notFound()

  const fotos = parseFotos(animal.foto_url)
  const nomeExibido = animal.nome ?? 'Sem nome'

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link
        href="/animais"
        className="inline-flex items-center gap-1 text-orange-500 font-medium hover:underline mb-6"
      >
        ← Voltar à listagem
      </Link>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <GaleriaFotos fotos={fotos} nome={animal.nome} adotado={animal.status === 'adotado'} />

        <div className="p-8 space-y-8">

          {/* Cabeçalho: nome + badges */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-800">{nomeExibido}</h1>
            <div className="flex flex-wrap gap-2 shrink-0">
              <Badge color="orange">{animal.porte}</Badge>
              <Badge color="orange">{animal.sexo === 'desconhecido' ? 'Sexo desconhecido' : animal.sexo}</Badge>
              {animal.castrado  && <Badge color="green">Castrado</Badge>}
              {animal.vacinado  && <Badge color="blue">Vacinado</Badge>}
              {animal.passou_por_vet && <Badge color="blue">Passou por vet</Badge>}
            </div>
          </div>

          {/* Descrição */}
          {animal.descricao && (
            <div>
              <Titulo>Sobre {nomeExibido}</Titulo>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{animal.descricao}</p>
            </div>
          )}

          {/* Identificação */}
          <div>
            <Titulo>Identificação</Titulo>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem label="Localização"    value={`${animal.cidade}, ${animal.estado}`} />
              <InfoItem label="Porte"          value={PORTE_LABEL[animal.porte] ?? animal.porte} />
              <InfoItem label="Sexo"           value={animal.sexo === 'macho' ? 'Macho' : animal.sexo === 'femea' ? 'Fêmea' : 'Desconhecido'} />
              <InfoItem label="Castrado"       value={animal.castrado ? 'Sim' : 'Não'} />
              <InfoItem label="Vacinado"       value={animal.vacinado ? 'Sim' : 'Não'} />
              {animal.idade_estimada && <InfoItem label="Idade estimada" value={animal.idade_estimada} />}
            </div>
          </div>

          {/* Saúde */}
          {(animal.passou_por_vet || animal.condicao_saude || animal.medicamento) && (
            <div>
              <Titulo>Saúde</Titulo>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoItem label="Passou por veterinário" value={animal.passou_por_vet ? 'Sim' : 'Não'} />
                {animal.condicao_saude && <InfoItem label="Condição de saúde"   value={animal.condicao_saude} />}
                {animal.medicamento    && <InfoItem label="Medicamento em uso"   value={animal.medicamento} />}
              </div>
            </div>
          )}

          {/* Comportamento */}
          <div>
            <Titulo>Comportamento</Titulo>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {animal.alimentacao && (
                <InfoItem label="Alimentação" value={ALIMENTACAO_LABEL[animal.alimentacao] ?? animal.alimentacao} />
              )}
              {animal.convive_criancas && (
                <InfoItem label="Convive com crianças" value={CONVIVENCIA_LABEL[animal.convive_criancas] ?? animal.convive_criancas} />
              )}
              {animal.convive_caes && (
                <InfoItem label="Convive com cães" value={CONVIVENCIA_LABEL[animal.convive_caes] ?? animal.convive_caes} />
              )}
              {animal.convive_gatos && (
                <InfoItem label="Convive com gatos" value={CONVIVENCIA_LABEL[animal.convive_gatos] ?? animal.convive_gatos} />
              )}
            </div>
            {animal.comportamento_especial && (
              <p className="mt-3 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 leading-relaxed whitespace-pre-line">
                {animal.comportamento_especial}
              </p>
            )}
          </div>

          {/* Histórico */}
          {(animal.tinha_dono || animal.foi_resgatado || animal.tempo_nas_ruas) && (
            <div>
              <Titulo>Histórico</Titulo>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoItem label="Tinha dono anterior"   value={animal.tinha_dono    ? 'Sim' : 'Não'} />
                <InfoItem label="Já foi resgatado antes" value={animal.foi_resgatado ? 'Sim' : 'Não'} />
                {animal.tempo_nas_ruas && <InfoItem label="Tempo nas ruas" value={animal.tempo_nas_ruas} />}
              </div>
            </div>
          )}

          {/* CTA */}
          {animal.status === 'disponivel' && (
            <div className="bg-orange-50 rounded-xl p-6 text-center">
              <p className="text-gray-600 mb-4">
                Tem interesse em adotar <strong>{nomeExibido}</strong>? Entre em contato com o responsável.
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
                <button disabled className="bg-gray-200 text-gray-400 font-bold px-8 py-3 rounded-full cursor-not-allowed">
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

// ── Helpers ───────────────────────────────────────────────────

function Titulo({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-orange-600 uppercase tracking-widest border-b border-orange-100 pb-2 mb-3">
      {children}
    </h2>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-gray-800 font-medium">{value}</p>
    </div>
  )
}

const BADGE_COLORS = {
  orange: 'bg-orange-100 text-orange-700',
  green:  'bg-green-100  text-green-700',
  blue:   'bg-blue-100   text-blue-700',
}

function Badge({ color, children }: { color: keyof typeof BADGE_COLORS; children: React.ReactNode }) {
  return (
    <span className={`text-sm px-3 py-1 rounded-full capitalize ${BADGE_COLORS[color]}`}>
      {children}
    </span>
  )
}
