import Link from 'next/link'
import { Search, User } from 'lucide-react'

export default function Home() {
  return (
      <div className="min-h-screen bg-white">
        <header className="bg-[#C4333B] text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold">Target</Link>
            <nav>
              <ul className="flex space-x-4">
                <li><Link href="/categories">Categorie</Link></li>
                <li><Link href="/sell">Vendi</Link></li>
                <li><Link href="/about">Chi Siamo</Link></li>

              </ul>
            </nav>
            <div className="flex space-x-4">
              <Link href="/search"><Search /></Link>
              <Link href="/login"><User /></Link>
            </div>
          </div>
        </header>

        <main>
          <section className="bg-[#41978F] text-white py-20">
            <div className="container mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Trova Tutto Ciò di Cui Hai Bisogno</h1>
              <p className="mb-8">Scopri prodotti di qualità a prezzi convenienti</p>
              <div className="max-w-2xl mx-auto relative">
                <input
                    type="text"
                    placeholder="Cerca articoli..."
                    className="w-full p-4 rounded-full text-black"
                />
                <button className="absolute right-2 top-2 bg-[#C4333B] text-white p-2 rounded-full">
                  <Search />
                </button>
              </div>
            </div>
          </section>

          <section className="py-16">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-[#C4333B]">Categorie in Evidenza</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {['Arredamento', 'Elettronica', 'Abbigliamento', 'Libri'].map((category) => (
                    <div key={category} className="bg-[#41978F] text-white p-6 rounded-lg text-center">
                      <h3 className="text-xl font-semibold">{category}</h3>
                    </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-gray-100">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center text-[#C4333B]">Articoli Popolari</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white p-6 rounded-lg shadow-md">
                      <div className="bg-gray-300 h-48 mb-4 rounded"></div>
                      <h3 className="text-xl font-semibold mb-2">Articolo Vintage {item}</h3>
                      <p className="text-gray-600 mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[#C4333B] font-bold">€29,99</span>
                        <button className="bg-[#41978F] text-white px-4 py-2 rounded">Visualizza</button>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-[#C4333B] text-white">
            <div className="container mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Acquista Ora!</h2>
              <p className="mb-8">Esplora la nostra vasta gamma di prodotti. Qualità e valore in ogni acquisto.</p>
              <button className="bg-white text-[#C4333B] px-8 py-3 rounded-full font-bold text-lg">Inizia lo Shopping</button>
            </div>
          </section>
        </main>

        <footer className="bg-gray-800 text-white py-8">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Target</h3>
              <p>Il tuo negozio per prodotti di qualità.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Link Rapidi</h4>
              <ul className="space-y-2">
                <li><Link href="/about">Chi Siamo</Link></li>
                <li><Link href="/contact">Contatti</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
                <li><Link href="/login">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Categorie</h4>
              <ul className="space-y-2">
                <li><Link href="/category/furniture">Arredamento</Link></li>
                <li><Link href="/category/electronics">Elettronica</Link></li>
                <li><Link href="/category/clothing">Abbigliamento</Link></li>
                <li><Link href="/category/books">Libri</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Seguici</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-[#41978F]">Facebook</a>
                <a href="#" className="hover:text-[#41978F]">Twitter</a>
                <a href="#" className="hover:text-[#41978F]">Instagram</a>
              </div>
            </div>
          </div>
          <div className="container mx-auto mt-8 pt-8 border-t border-gray-700 text-center">
            <p>&copy; 2023 Target. Tutti i diritti riservati.</p>
          </div>
        </footer>
      </div>
  )
}
