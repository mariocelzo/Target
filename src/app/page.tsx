'use client';

import { useState, useEffect, useCallback } from 'react';
import { query, collection, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Search, User, ChevronDown, LogOut, MessageCircle, Edit } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import Footer from "@/app/components/Footer";

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  sold?: boolean;
  userId: string;
  image: string;
  category: string;
  condition: string;
  createdAt: string;
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
  const [user, setUser] = useState<User | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const router = useRouter();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email || '',
        });
        fetchUserImage(currentUser.uid);
        fetchUnreadMessages(currentUser.uid);
        fetchUserProducts(currentUser.uid);
      } else {
        setUser(null);
        setUserImage(null);
        setUserProducts([]);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleSearchChange = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        const queryText = e.target.value;
        setSearchQuery(queryText);

        if (queryText.trim()) {
          setIsLoading(true);

          try {
            const q = query(
                collection(db, 'products'),
                where('name', '>=', queryText),
                where('name', '<=', queryText + '\uf8ff')
            );

            const querySnapshot = await getDocs(q);
            const results: Product[] = [];

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
      [user]
  );

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${searchQuery}`);
    }
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const fetchUserImage = async (userId: string) => {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      setUserImage(userData?.imageUrl || null);
    }
  };

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

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#C4333B] to-[#41978F] text-white py-4 shadow-lg">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="text-3xl font-extrabold flex items-center space-x-2">
              <Image src="/logoNosfondo.png" alt="Logo" width={40} height={40} />
              <span>Target Marketplace</span>
            </Link>

            <nav className="hidden md:flex space-x-6 text-lg">
              <CategoryDropdown />
              <NavLink href="/sell">Vendi</NavLink>
              <NavLink href="/about">Chi Siamo</NavLink>
            </nav>

            <div className="flex items-center space-x-6">
              <UserMenu user={user} userImage={userImage} handleLogout={handleLogout} />
              <ChatNotification user={user} unreadMessagesCount={unreadMessagesCount} />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#41978F] to-[#2C6D68] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-extrabold mb-6 animate-fade-in-down">Trova e Vendi con Facilità!</h1>
            <p className="text-xl mb-8 animate-fade-in-up">
              Scopri articoli di seconda mano a ottimi prezzi o vendi ciò di cui non hai più bisogno!
            </p>

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
                <Search size={20} />
              </button>

              <SearchResults searchQuery={searchQuery} isLoading={isLoading} searchResults={searchResults} />
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-semibold mb-12 text-gray-800">Categorie in Evidenza</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <CategoryCard name="Elettronica" image="/elettronica.png" href="/categories/Elettronica" />
              <CategoryCard name="Moda" image="/moda.png" href="/categories/Moda" />
              <CategoryCard name="Arredamento" image="/arredamento.png" href="/categories/Arredamento" />
              <CategoryCard name="Auto e Moto" image="/auto.png" href="/categories/Giocattoli" />
            </div>
          </div>
        </section>

        {/* User Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-semibold mb-12 text-gray-800">I tuoi articoli in vendita</h2>
            {userProducts.filter(product => !product.sold).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {userProducts
                      .filter(product => !product.sold)
                      .map((product) => (
                          <ProductCard key={product.id} product={product} onClick={() => openProductDetails(product)} />
                      ))}
                </div>
            ) : (
                <p className="text-xl text-gray-600">Non hai ancora pubblicato articoli in vendita o sono stati tutti venduti.</p>
            )}
          </div>
        </section>

        {/* Product Details Modal */}
        {isModalOpen && selectedProduct && (
            <ProductModal product={selectedProduct} onClose={closeProductDetails} />
        )}

        <Footer />
      </div>
  );
}

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="hover:text-teal-300 transition-colors duration-200">
      {children}
    </Link>
);

const CategoryDropdown = () => (
    <div className="relative group">
      <button className="hover:text-teal-300 transition-colors duration-200">
        Categorie
        <ChevronDown size={16} className="inline ml-1" />
      </button>
      <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          <CategoryLink href="/categories/Elettronica">Elettronica</CategoryLink>
          <CategoryLink href="/categories/Arredamento">Arredamento</CategoryLink>
          <CategoryLink href="/categories/Moda">Moda</CategoryLink>
          <CategoryLink href="/categories/Auto-e-Moto">Auto e Moto</CategoryLink>
        </div>
      </div>
    </div>
);

const CategoryLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
      {children}
    </Link>
);

const UserMenu = ({ user, userImage, handleLogout }: { user: User | null; userImage: string | null; handleLogout: () => void }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return user ? (
      <div className="relative">
        <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 hover:text-gray-200"
        >
          {userImage ? (
              <Image src={userImage} alt="Profilo" width={32} height={32} className="rounded-full" />
          ) : (
              <User size={20} />
          )}
          <span>{user.displayName || user.email}</span>
          <ChevronDown size={16} />
        </button>
        {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
              <div className="py-1">
                <UserMenuItem href="/user-area">Profilo</UserMenuItem>
                <UserMenuItem href="/ordereffettuati">I miei ordini</UserMenuItem>
                <UserMenuItem href="/user-active-ads">I miei annunci</UserMenuItem>
                <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <LogOut size={16} className="inline mr-2" /> Esci
                </button>
              </div>
            </div>
        )}
      </div>
  ) : (
      <Link href="/login" className="hover:text-gray-200 transition-colors duration-200">
        Login
      </Link>
  );
};

const UserMenuItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
      {children}
    </Link>
);

const ChatNotification = ({ user, unreadMessagesCount }: { user: User | null; unreadMessagesCount: number }) => {
  const router = useRouter();
  return user && (
      <div className="relative">
        <button
            onClick={() => router.push(`/chat/${user.uid}`)}
            className="flex items-center space-x-2 hover:text-gray-200"
        >
          <MessageCircle size={20} />
          {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">
            {unreadMessagesCount}
          </span>
          )}
        </button>
      </div>
  );
};

const SearchResults = ({ searchQuery, isLoading, searchResults }: { searchQuery: string; isLoading: boolean; searchResults: Product[] }) => (
    searchQuery && (
        <div className="absolute bg-white w-full shadow-lg rounded-lg mt-2 overflow-hidden max-h-60 transition-all duration-300 ease-in-out">
          {isLoading ? (
              <div className="p-4 text-center flex justify-center items-center">
                <div className="animate-spin h-8 w-8 border-4 border-t-4 border-[#C4333B] border-solid rounded-full"></div>
              </div>
          ) : searchResults.length > 0 ? (
              <ul className="max-h-60 overflow-y-auto">
                {searchResults.map((result) => (
                    <li key={result.id} className="px-4 py-2 border-b hover:bg-[#F1F1F1] transition-all duration-200">
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
    )
);

const CategoryCard = ({ name, image, href }: { name: string; image: string; href: string }) => (
    <div
        className="bg-white shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl transform hover:-translate-y-2"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '200px',
        }}
    >
      <Link href={href}>
        <div className="h-full w-full flex items-end bg-gradient-to-t from-black to-transparent p-6">
          <h3 className="text-2xl font-bold text-white">{name}</h3>
        </div>
      </Link>
    </div>
);

const ProductCard = ({ product, onClick }: { product: Product; onClick: () => void }) => (
    <div
        className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
        onClick={onClick}
    >
      <div className="relative h-48">
        <Image
            src={product.image}
            alt={product.name}
            layout="fill"
            objectFit="cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
        <p className="text-gray-500">{product.category}</p>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
        <p className="text-lg font-bold text-[#C4333B] mt-2">{product.price} €</p>
      </div>
    </div>
);

const ProductModal = ({ product, onClose }: { product: Product; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
        <button
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
            onClick={onClose}
        >
          ✕
        </button>

        <div className="relative h-64 mb-4">
          <Image
              src={product.image}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
          />
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{product.name}</h2>
          <Link
              href={`/edit/${product.id}`}
              className="bg-teal-500 text-white p-2 rounded-full hover:bg-blue-500 transition-colors duration-200"
              title="Modifica annuncio"
          >
            <Edit size={20} />
          </Link>
        </div>

        <p className="text-gray-500 mb-4">{product.category}</p>
        <p className="text-gray-700 mb-4">{product.description}</p>
        <p className="font-semibold mb-4">
          Prezzo: <span className="text-[#C4333B]">{product.price} €</span>
        </p>
        <p className="text-sm text-gray-500">
          Condizione: {product.condition}
        </p>
        <p className="text-sm text-gray-500">
          Creato il: {new Date(product.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
);

