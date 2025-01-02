'use client';

import { useState, useEffect, useCallback } from 'react';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Search, User, ChevronDown, LogOut, MessageCircle } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import Footer from "@/app/components/Footer";
import { doc, getDoc } from 'firebase/firestore';

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
  const [userImage, setUserImage] = useState<string | null>(null); // Stato per la foto profilo
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
        fetchUserImage(currentUser.uid); // Recupera la foto dell'utente appena autenticato
      } else {
        setUser(null);
        setUserImage(null); // Reset della foto se l'utente esce
      }
    });

    return () => unsubscribe();
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
  const fetchUserImage = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUserImage(userData?.imageUrl || null); // Imposta la foto o null se non trovata
    }
  };
  const [userProducts, setUserProducts] = useState<Product[]>([]);

// Recupera gli articoli in vendita dell'utente
  const fetchUserProducts = async (userId: string) => {
    try {
      const q = query(collection(db, "products"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      const products: Product[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Product),
      }));
      setUserProducts(products);
    } catch (error) {
      console.error("Errore durante il recupero degli articoli:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserProducts(user.uid); // Assicurati di avere l'ID utente autenticato
    }
  }, [user]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  return (
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <header className="bg-[#C4333B] text-white py-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo e nome Marketplace a sinistra */}
            <Link href="/" className="text-3xl font-extrabold">
              Target Marketplace
            </Link>

            {/* Navbar centrata */}
            <nav className="flex justify-center flex-1 space-x-6 text-lg">
              <ul className="flex space-x-6">
                <li className="relative group">
                  {/* Link principale per "Categorie" */}
                  <button
                      className="hover:text-teal-500 hover:scale-105 transition-all duration-200 ease-in-out focus:outline-none">
                    Categorie
                  </button>

                  {/* Dropdown menu */}
                  <div
                      className="absolute left-0 mt-2 hidden w-48 bg-white text-black shadow-lg rounded-lg group-hover:block">
                    <ul className="py-2">
                      <li>
                        <Link href="/categories/Elettronica" className="block px-4 py-2 hover:bg-gray-100">
                          Elettronica
                        </Link>
                      </li>
                      <li>
                        <Link href="/categories/Arredamento" className="block px-4 py-2 hover:bg-gray-100">
                          Arredamento
                        </Link>
                      </li>
                      <li>
                        <Link href="/categories/Moda" className="block px-4 py-2 hover:bg-gray-100">
                          Moda
                        </Link>
                      </li>
                      <li>
                        <Link href="/categories/Giocattoli" className="block px-4 py-2 hover:bg-gray-100">
                          Auto e Moto
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
                <li>
                  <Link
                      href="/sell"
                      className="hover:text-teal-500 hover:scale-105 transition-all duration-200 ease-in-out">
                    Vendi
                  </Link>
                </li>
                <li>
                  <Link
                      href="/about"
                      className="hover:text-teal-500 hover:scale-105 transition-all duration-200 ease-in-out">
                    Chi Siamo
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Sezione Utente e Chat */}
            <div className="flex items-center space-x-6">
              {/* Sezione Utente */}
              {user ? (
                  <div className="relative">
                    <button
                        onClick={toggleDropdown}
                        className="flex items-center space-x-2 hover:text-gray-200">
                      {userImage ? (
                          <img
                              src={userImage}
                              alt="Profilo"
                              className="w-8 h-8 rounded-full"
                          />
                      ) : (
                          <User size={20}/>
                      )}
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
                    <button
                        onClick={() => router.push(`/chat/${user.uid}`)}
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
        {/* Sezione Articoli dell'utente */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl font-semibold mb-8 text-gray-800">I tuoi articoli in vendita</h2>
            {userProducts.filter(product => !product.sold).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {userProducts
                      .filter(product => !product.sold) // Filtra solo i prodotti non venduti
                      .map((product) => (
                          <div
                              key={product.id}
                              className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                              onClick={() => openProductDetails(product)}
                          >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-4">
                              <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                              <p className="text-gray-500">{product.category}</p>
                              <p className="text-sm text-gray-600 mt-2">{product.description}</p>
                            </div>
                          </div>
                      ))}
                </div>
            ) : (
                <p className="text-gray-500">Non hai ancora pubblicato articoli in vendita o sono stati tutti venduti.</p>
            )}
          </div>

          {/* Modale per i dettagli del prodotto */}
          {isModalOpen && selectedProduct && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
                <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                  <button
                      className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                      onClick={closeProductDetails}
                  >
                    ✕
                  </button>

                  {/* Immagine del prodotto */}
                  <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-64 object-cover rounded-lg mb-4"
                  />

                  {/* Intestazione con nome e icona modifica */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                    <a
                        href={`/edit/${selectedProduct.id}`}
                        className="relative inline-flex items-center justify-center w-10 h-10 bg-teal-500 text-white rounded-full hover:bg-blue-500 transition-colors duration-200"
                        title="Modifica annuncio"
                    >
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-6 h-6"
                      >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.232 5.232l3.536 3.536m-2.036-7.768a2.25 2.25 0 013.182 3.182L7.875 21H4.5v-3.375L16.732 2.464z"
                        />
                      </svg>
                    </a>
                  </div>

                  {/* Dettagli del prodotto */}
                  <p className="text-gray-500 mb-4">{selectedProduct.category}</p>
                  <p className="text-gray-700 mb-4">{selectedProduct.description}</p>
                  <p className="font-semibold mb-4">
                    Prezzo: <span className="text-[#C4333B]">{selectedProduct.price} €</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Condizione: {selectedProduct.condition}
                  </p>
                  <p className="text-sm text-gray-500">
                    Creato il: {new Date(selectedProduct.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
          )}
        </section>
        <Footer/>
      </div>
  );
}
