import Link from 'next/link'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-orange-500 text-white py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">Todo cão merece um lar</h1>
        <p className="text-xl mb-8 text-orange-100">
          Encontrou um cão abandonado? Quer adotar? O Amicão conecta você a quem precisa.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/animais"
            className="bg-white text-orange-500 font-bold px-8 py-3 rounded-full hover:bg-orange-50 transition"
          >
            Quero adotar
          </Link>
          <Link
            href="/animais/novo"
            className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-orange-600 transition"
          >
            Encontrei um cão
          </Link>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-12">Como funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="font-bold text-lg mb-2">Anuncie</h3>
            <p className="text-gray-500 text-sm">Encontrou um cão? Cadastre com foto e localização em minutos.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-bold text-lg mb-2">Encontre</h3>
            <p className="text-gray-500 text-sm">Filtre por região, porte e características. Veja quem está perto de você.</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="font-bold text-lg mb-2">Adote</h3>
            <p className="text-gray-500 text-sm">Manifeste interesse, passe pela triagem e dê um lar a quem precisa.</p>
          </div>
        </div>
      </section>
    </div>
  )
}