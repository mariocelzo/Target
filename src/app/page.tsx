'use client'

import { useEffect, useState, useCallback } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore'
import Link from 'next/link'
import { Search, User, ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<import('firebase/auth').User | null>(null)
  const [fullName, setFullName] = useState<string>('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user)
        const userRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(userRef)
        if (docSnap.exists()) {
          setFullName(docSnap.data().fullName)
        }
      } else {
        setUser(null)
        setFullName('')
      }
    })
    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setFullName('')
    } catch (error) {
      console.error("Errore durante il logout", error)
    }
  }

  const toggleMenu = () => {
    setMenuOpen(prevState => !prevState)
  }

  // Debounced search to optimize the search flow and reduce Firestore calls
  const handleSearchChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const queryText = e.target.value
        setSearchQuery(queryText)

        if (queryText.trim()) {
          setIsLoading(true)

          const q = query(
              collection(db, 'products'),
              where('title', '>=', queryText),
              where('title', '<=', queryText + '\uf8ff')
          )

          try {
            const querySnapshot = await getDocs(q)
            const results: any[] = []
            querySnapshot.forEach((doc) => {
              results.push({ id: doc.id, ...doc.data() })
            })
            setSearchResults(results)
          } catch (error) {
            console.error('Errore durante la ricerca:', error)
          } finally {
            setIsLoading(false)
          }
        } else {
          setSearchResults([])
          setIsLoading(false)
        }
      },
      [db]
  )

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${searchQuery}`)
    }
  }

  return (
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <header className="bg-[#C4333B] text-white py-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-3xl font-extrabold">
              Target Marketplace
            </Link>
            <nav>
              <ul className="flex space-x-6 text-lg">
                <li><Link href="/" className="hover:text-gray-200">Home</Link></li>
                <li><Link href="/categories" className="hover:text-gray-200">Categorie</Link></li>
                <li><Link href="/sell" className="hover:text-gray-200">Vendi</Link></li>
                <li><Link href="/about" className="hover:text-gray-200">Chi Siamo</Link></li>
              </ul>
            </nav>
            <div className="flex space-x-4">
              <Link href="/search" className="text-white hover:text-gray-200">
                <Search size={24} />
              </Link>
              {!user ? (
                  <Link href="/login" className="text-white hover:text-gray-200">
                    <User size={24} />
                  </Link>
              ) : (
                  <div className="relative text-white">
                <span
                    className="mr-4 cursor-pointer flex items-center space-x-1"
                    onClick={toggleMenu}
                >
                  <span>{fullName || user?.displayName || user?.email}</span>
                  <ChevronDown size={16} />
                </span>
                    {menuOpen && (
                        <div className="absolute right-0 bg-white text-black shadow-lg rounded-lg w-48 mt-2">
                          <ul className="py-2">
                            <li><Link href="/user-area" className="block px-4 py-2 hover:bg-gray-200">Area Personale</Link></li>
                            <li><Link href="/user-active-ads" className="block px-4 py-2 hover:bg-gray-200">Annunci Attivi</Link></li>
                            <li><button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-200">Logout</button></li>
                          </ul>
                        </div>
                    )}
                  </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-[#41978F] text-white py-20">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-extrabold mb-6">Trova e Vendi con Facilità!</h1>
            <p className="text-lg mb-8">Scopri articoli di seconda mano a ottimi prezzi o vendi ciò di cui non hai più bisogno!</p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <input
                  type="text"
                  placeholder="Cerca articoli..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full p-4 rounded-full text-black shadow-lg focus:outline-none"
              />
              <button onClick={handleSearch} className="absolute right-2 top-2 bg-[#C4333B] text-white p-2 rounded-full">
                <Search size={20} />
              </button>

              {/* Dropdown for search results */}
              {searchQuery && !isLoading && searchResults.length > 0 && (
                  <div className="absolute bg-white w-full shadow-lg rounded-lg mt-2">
                    <ul className="max-h-60 overflow-y-auto">
                      {searchResults.map((result) => (
                          <li key={result.id} className="px-4 py-2 border-b">
                            <Link href={`/products/${result.id}`} className="block">
                              <div className="font-bold">{result.title}</div>
                              <div className="text-sm text-gray-500">{result.description}</div>
                            </Link>
                          </li>
                      ))}
                    </ul>
                  </div>
              )}

              {/* Show loading indicator */}
              {isLoading && searchQuery && (
                  <div className="absolute bg-white w-full shadow-lg rounded-lg mt-2 p-2 text-center">
                    Caricamento...
                  </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className="py-16">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-semibold mb-6">Categorie in Evidenza</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              <div className="bg-white shadow-md rounded-lg p-6">
                <Link href="/categories/Elettronica">
                  <h3 className="text-xl font-bold mb-4">Elettronica</h3>
                </Link>
              </div>
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Moda</h3>
                <Link href="/categories/Moda">
                  <img src="/images/fashion.jpg" alt="Moda" className="w-full h-48 object-cover rounded-lg" />
                </Link>
              </div>
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Arredamento</h3>
                <Link href="/categories/Arredamento">
                  <img src="/images/furniture.jpg" alt="Arredamento" className="w-full h-48 object-cover rounded-lg" />
                </Link>
              </div>
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4">Giocattoli</h3>
                <Link href="/categories/Giocattoli">
                  <img src="/images/toys.jpg" alt="Giocattoli" className="w-full h-48 object-cover rounded-lg" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#41978F] text-white py-8">
          <div className="container mx-auto text-center">
            <p className="text-lg">&copy; 2024 Target Marketplace. Tutti i diritti riservati.</p>
            <div className="mt-4">
              <ul className="flex justify-center space-x-6">
                <li><Link href="/privacy-policy" className="hover:text-gray-200">Privacy Policy</Link></li>
                <li><Link href="/terms-of-service" className="hover:text-gray-200">Termini di Servizio</Link></li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
  )
}
