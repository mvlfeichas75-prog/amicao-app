'use client'

import { useState } from 'react'

interface Props {
  animalId: string
  nomeAnimal: string
}

export default function ModalInteresse({ animalId, nomeAnimal }: Props) {
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  function abrir() {
    setAberto(true)
    setSucesso(false)
    setErro(null)
  }

  function fechar() {
    setAberto(false)
    setNome('')
    setEmail('')
    setTelefone('')
    setMotivo('')
    setSucesso(false)
    setErro(null)
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErro(null)
    try {
      const res = await fetch('/api/interesse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animalId, nome, email, telefone, motivo }),
      })
      const json = await res.json()
      if (!res.ok) {
        setErro(json.error ?? 'Erro ao enviar. Tente novamente.')
      } else {
        setSucesso(true)
      }
    } catch {
      setErro('Erro ao enviar. Verifique sua conexão.')
    } finally {
      setEnviando(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400'

  return (
    <>
      <button
        onClick={abrir}
        className="inline-block bg-orange-500 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition"
      >
        Tenho interesse
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={fechar}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Quero adotar {nomeAnimal}</h2>
              <button
                onClick={fechar}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {sucesso ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-700 font-semibold text-lg">Interesse enviado!</p>
                <p className="text-gray-500 text-sm">
                  O responsável por <strong>{nomeAnimal}</strong> vai receber seu contato e retornará em breve.
                </p>
                <button
                  onClick={fechar}
                  className="mt-2 text-sm text-orange-500 hover:underline"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={enviar} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Nome completo *
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={e => setNome(e.target.value)}
                    required
                    placeholder="Seu nome completo"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="voce@email.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Telefone{' '}
                    <span className="normal-case font-normal text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={e => setTelefone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Por que você quer adotar este animal? *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    required
                    rows={4}
                    placeholder="Conte um pouco sobre você e por que quer adotar..."
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {erro && <p className="text-sm text-red-500">{erro}</p>}

                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full bg-orange-500 text-white font-bold py-3 rounded-full hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enviando ? 'Enviando…' : 'Enviar interesse'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
