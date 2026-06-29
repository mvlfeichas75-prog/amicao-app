'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Props {
  animalId: string
  statusAtual: string
}

export default function ModalGerenciar({ animalId, statusAtual }: Props) {
  const router = useRouter()
  const [aberto, setAberto] = useState(false)
  const [codigo, setCodigo] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [autorizado, setAutorizado] = useState(false)
  const [erroVerificacao, setErroVerificacao] = useState<string | null>(null)
  const [status, setStatus] = useState(statusAtual)
  const [salvandoStatus, setSalvandoStatus] = useState(false)
  const [removendo, setRemovendo] = useState(false)

  function abrir() {
    setAberto(true)
    setCodigo('')
    setAutorizado(false)
    setErroVerificacao(null)
  }

  async function verificarCodigo(e: React.FormEvent) {
    e.preventDefault()
    setVerificando(true)
    setErroVerificacao(null)
    try {
      const res = await fetch('/api/verificar-codigo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animalId, codigo }),
      })
      const json = await res.json()
      if (json.valido) {
        setAutorizado(true)
      } else {
        setErroVerificacao('Código incorreto. Verifique o email que recebeu ao cadastrar o anúncio.')
      }
    } catch {
      setErroVerificacao('Erro ao verificar o código. Tente novamente.')
    } finally {
      setVerificando(false)
    }
  }

  async function alterarStatus(novoStatus: string) {
    setSalvandoStatus(true)
    const { error } = await supabase
      .from('animais')
      .update({ status: novoStatus })
      .eq('id', animalId)
    if (error) {
      alert(`Erro ao alterar status: ${error.message}`)
    } else {
      setStatus(novoStatus)
      router.refresh()
    }
    setSalvandoStatus(false)
  }

  async function removerAnuncio() {
    if (!confirm('Tem certeza que deseja remover este anúncio? Esta ação não pode ser desfeita.')) return
    setRemovendo(true)
    const { error } = await supabase.from('animais').delete().eq('id', animalId)
    if (error) {
      alert(`Erro ao remover o anúncio: ${error.message}`)
      setRemovendo(false)
      return
    }
    router.push('/animais')
  }

  return (
    <>
      <button
        onClick={abrir}
        className="text-sm text-orange-500 hover:text-orange-600 font-medium hover:underline transition"
      >
        Gerenciar anúncio
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setAberto(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Gerenciar anúncio</h2>
              <button
                onClick={() => setAberto(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {!autorizado ? (
              <form onSubmit={verificarCodigo} className="space-y-4">
                <p className="text-sm text-gray-500">
                  Insira o código de 6 dígitos enviado para o seu email quando o anúncio foi cadastrado.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  autoFocus
                />
                {erroVerificacao && (
                  <p className="text-sm text-red-500">{erroVerificacao}</p>
                )}
                <button
                  type="submit"
                  disabled={codigo.length !== 6 || verificando}
                  className="w-full bg-orange-500 text-white font-bold py-2.5 rounded-full hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {verificando ? 'Verificando…' : 'Confirmar'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-green-600 font-medium">Código verificado. O que deseja fazer?</p>

                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status do anúncio</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => alterarStatus('disponivel')}
                      disabled={status === 'disponivel' || salvandoStatus}
                      className={`flex-1 py-2 rounded-full text-sm font-medium border-2 transition disabled:cursor-not-allowed ${
                        status === 'disponivel'
                          ? 'border-orange-500 bg-orange-50 text-orange-600'
                          : 'border-gray-200 text-gray-600 hover:border-orange-300'
                      }`}
                    >
                      Disponível
                    </button>
                    <button
                      onClick={() => alterarStatus('adotado')}
                      disabled={status === 'adotado' || salvandoStatus}
                      className={`flex-1 py-2 rounded-full text-sm font-medium border-2 transition disabled:cursor-not-allowed ${
                        status === 'adotado'
                          ? 'border-green-500 bg-green-50 text-green-600'
                          : 'border-gray-200 text-gray-600 hover:border-green-300'
                      }`}
                    >
                      Adotado
                    </button>
                  </div>
                  {salvandoStatus && <p className="text-xs text-gray-400 text-center">Salvando…</p>}
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Gerenciar fotos</p>
                  <p className="text-sm text-gray-500">
                    Use a galeria de fotos no topo desta página para adicionar ou remover fotos do anúncio.
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={removerAnuncio}
                    disabled={removendo}
                    className="w-full text-sm text-red-500 hover:text-red-600 font-medium py-2 rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {removendo ? 'Removendo…' : 'Remover anúncio permanentemente'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
