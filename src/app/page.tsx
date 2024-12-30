'use client';

import { useState, useEffect, useCallback } from 'react';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Search, User, ChevronDown, LogOut, MessageCircle } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import Footer from "@/app/components/Footer";

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  sold?: boolean;
  userId: string;
}

interface User {
  uid: string;
  displayName: string | null;
  email: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Specify the type here
  const router = useRouter();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Ascolta i cambiamenti nell'autenticazione dell'utente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email || '',
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Pulizia dell'event listener
  }, []);

  // Funzione per recuperare il conteggio dei messaggi non letti
  const fetchUnreadMessages = async (userId: string) => {
    const q = query(
        collection(db, 'chats'),
        where('buyerId', '==', userId),
        where('messages.read', '==', false)
    );

    try {
      const querySnapshot = await getDocs(q);
      let unreadCount = 0;
      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        chatData.messages.forEach((message: any) => {
          if (!message.read && message.senderId !== userId) {
            unreadCount++;
          }
        });
      });

      setUnreadMessagesCount(unreadCount);
    } catch (error) {
      console.error('Errore durante il recupero dei messaggi:', error);
    }
  };

  // Chiamata per recuperare il conteggio dei messaggi non letti ogni volta che l'utente è cambiato
  useEffect(() => {
    if (user) {
      fetchUnreadMessages(user.uid);
    }
  }, [user]);

  // Gestione del cambio nel campo di ricerca
  const handleSearchChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const queryText = e.target.value;
        setSearchQuery(queryText);

        if (queryText.trim()) {
          setIsLoading(true);

          try {
            // Query per i prodotti per titolo
            const q = query(
                collection(db, 'products'),
                where('name', '>=', queryText),
                where('name', '<=', queryText + '\uf8ff')
            );

            const querySnapshot = await getDocs(q);
            const results: Product[] = [];

            // Filtraggio client-side per i prodotti dell'utente corrente
            querySnapshot.forEach((doc) => {
              const product = { id: doc.id, ...doc.data() } as Product;
              if (product.userId !== user?.uid && (product.sold === false || !product.hasOwnProperty('sold'))) {
                results.push(product);
              }
            });

            setSearchResults(results);
          } catch (error) {
            console.error('Errore durante la ricerca:', error);
          } finally {
            setIsLoading(false);
          }
        } else {
          setSearchResults([]);
          setIsLoading(false);
        }
      },
      [user] // Dipendenza dall'utente
  );

  // Gestione del pulsante di ricerca
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${searchQuery}`);
    }
  };

  // Funzione di toggle per il dropdown utente
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Funzione di logout
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Disconnette l'utente
      setUser(null); // Rimuove l'utente dallo stato
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <header className="bg-[#C4333B] text-white py-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-3xl font-extrabold">
              Target Marketplace
            </Link>
            <nav className="flex-1 flex justify-center space-x-6 text-lg">
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className="hover:text-gray-200">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/categories" className="hover:text-gray-200">
                    Categorie
                  </Link>
                </li>
                <li>
                  <Link href="/sell" className="hover:text-gray-200">
                    Vendi
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-gray-200">
                    Chi Siamo
                  </Link>
                </li>
              </ul>
            </nav>
            {/* Sezione Utente */}
            {user ? (
                <div className="relative">
                  <button onClick={toggleDropdown} className="flex items-center space-x-2 hover:text-gray-200">
                    <User size={20}/>
                    <span>{user.displayName || user.email}</span>
                    <ChevronDown size={16}/>
                  </button>
                  {dropdownOpen && (
                      <div className="absolute right-0 bg-white text-black mt-2 shadow-md rounded-lg w-48">
                        <ul>
                          <li className="px-4 py-2 hover:bg-gray-100">
                            <Link href="/user-area">Profilo</Link>
                          </li>
                          <li className="px-4 py-2 hover:bg-gray-100">
                            <Link href="/ordereffettuati">I miei ordini</Link>
                          </li>
                          <li className="px-4 py-2 hover:bg-gray-100">
                            <Link href="/user-active-ads">I miei annunci</Link>
                          </li>
                          <li className="px-4 py-2 hover:bg-gray-100" onClick={handleLogout}>
                            <LogOut size={16}/> Esci
                          </li>
                        </ul>
                      </div>
                  )}
                </div>
            ) : (
                <Link href="/login" className="hover:text-gray-200">
                  Login
                </Link>
            )}
            {/* Icona Chat con contatore di notifiche */}
            {user && (
                <div className="relative">
                  <button onClick={() => router.push(`/chat/${user.uid}`)}
                          className="flex items-center space-x-2 hover:text-gray-200">
                    <MessageCircle size={20}/>
                    {unreadMessagesCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadMessagesCount}
                  </span>
                    )}
                  </button>
                </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-[#41978F] text-white py-20">
          <div className="container mx-auto text-center">
            <h1 className="text-5xl font-extrabold mb-6">Trova e Vendi con Facilità!</h1>
            <p className="text-lg mb-8">
              Scopri articoli di seconda mano a ottimi prezzi o vendi ciò di cui non hai più bisogno!
            </p>

            {/* Barra di ricerca */}
            <div className="relative max-w-2xl mx-auto">
              <input
                  type="text"
                  placeholder="Cerca articoli..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full p-4 rounded-full text-black shadow-lg focus:outline-none transition-all duration-300 ease-in-out"
              />
              <button
                  onClick={handleSearch}
                  className="absolute right-2 top-2 bg-[#C4333B] text-white p-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110"
              >
                <Search size={20}/>
              </button>

              {/* Risultati della ricerca */}
              {searchQuery && (
                  <div
                      className="absolute bg-white w-full shadow-lg rounded-lg mt-2 overflow-hidden max-h-60 transition-all duration-300 ease-in-out">
                    {isLoading ? (
                        <div className="p-4 text-center flex justify-center items-center">
                          <div
                              className="animate-spin h-8 w-8 border-4 border-t-4 border-[#C4333B] border-solid rounded-full"></div>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <ul className="max-h-60 overflow-y-auto">
                          {searchResults.map((result) => (
                              <li key={result.id}
                                  className="px-4 py-2 border-b hover:bg-[#F1F1F1] transition-all duration-200">
                                <Link href={`/products/${result.id}`} className="flex flex-col">
                                  <div className="font-bold text-[#333]">{result.name}</div>
                                  <div className="text-sm text-gray-500">{result.description}</div>
                                </Link>
                              </li>
                          ))}
                        </ul>
                    ) : (
                        <div className="p-4 text-center text-gray-500">Nessun risultato trovato</div>
                    )}
                  </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-semibold mb-8 text-gray-800">Categorie in Evidenza</h2>
            <div
                className="flex gap-8 pb-4 animate-scroll hover:animate-none"> {/* Ferma lo scroll al passaggio del mouse */}
              {/* Categoria Elettronica */}
              <div
                  className="flex-shrink-0 w-80 h-56 bg-white shadow-lg rounded-lg p-6 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-teal-600 hover:text-white transform hover:-translate-y-2"
                  style={{
                    backgroundImage: 'url(/elettronica.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)', // Ombra aggiunta al div
                  }}
              >
                <Link href="/categories/Elettronica">
                  <h3 className="text-2xl font-bold mb-4 text-red-600 hover:text-white transition-all duration-300 ease-in-out">
                    Elettronica
                  </h3>
                </Link>
              </div>

              {/* Categoria Moda */}
              <div
                  className="flex-shrink-0 w-80 h-56 bg-white shadow-lg rounded-lg p-6 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-teal-600 hover:text-white transform hover:-translate-y-2"
                  style={{
                    backgroundImage: 'url(/moda.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)', // Ombra aggiunta al div
                  }}
              >
                <Link href="/categories/Moda">
                  <h3 className="text-2xl font-bold mb-4 text-red-600 hover:text-white transition-all duration-300 ease-in-out">
                    Moda
                  </h3>
                </Link>
              </div>

              {/* Categoria Arredamento */}
              <div
                  className="flex-shrink-0 w-80 h-56 bg-white shadow-lg rounded-lg p-6 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-teal-600 hover:text-white transform hover:-translate-y-2"
                  style={{
                    backgroundImage: 'url(/arredamento.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)', // Ombra aggiunta al div
                  }}
              >
                <Link href="/categories/Arredamento">
                  <h3 className="text-2xl font-bold mb-4 text-red-600 hover:text-white transition-all duration-300 ease-in-out">
                    Arredamento
                  </h3>
                </Link>
              </div>

              {/* Categoria Auto e Moto */}
              <div
                  className="flex-shrink-0 w-80 h-56 bg-white shadow-lg rounded-lg p-6 transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl hover:bg-teal-600 hover:text-white transform hover:-translate-y-2"
                  style={{
                    backgroundImage: 'url(/auto.png)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), 0 6px 20px rgba(0, 0, 0, 0.15)', // Ombra aggiunta al div
                  }}
              >
                <Link href="/categories/Giocattoli">
                  <h3 className="text-2xl font-bold mb-4 text-red-600 hover:text-white transition-all duration-300 ease-in-out">
                    Auto e Moto
                  </h3>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer/>
      </div>
  );
}
