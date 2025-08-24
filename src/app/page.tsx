'use client';

import { useState, useEffect } from 'react';
import {
  query,
  collection,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db, auth } from '@/data/firebase';
import { useRouter } from 'next/navigation';
import {
  Search,
  User,
  ChevronDown,
  LogOut,
  MessageCircle,
  Edit,
  Bell,
  ClipboardList,
  Package, Smile,
} from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import Image from 'next/image';
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";

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

interface Notification {
  id: string;
  productId: string;
  productName: string;
  buyerName: string;
  createdAt: string;
  sellerId: string; // Added sellerId
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const router = useRouter();
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [newNotificationsCount, setNewNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const markNotificationAsRead = (notificationId: string) => {
    if (!user) return;
    
    const newReadNotifications = new Set([...readNotifications, notificationId]);
    setReadNotifications(newReadNotifications);
    
    // Update counter if this was an unread notification
    if (!readNotifications.has(notificationId)) {
      setNewNotificationsCount(prev => Math.max(0, prev - 1));
    }
    
    // Save to localStorage
    saveReadNotifications(user.uid, newReadNotifications);
  };

  const saveReadNotifications = (userId: string, readIds: Set<string>) => {
    localStorage.setItem(`readNotifications_${userId}`, JSON.stringify([...readIds]));
  };
  const { theme } = useTheme();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email || '',
        });
        fetchUserImage(currentUser.uid);
        fetchUnreadMessages(currentUser.uid);
        fetchUserProducts(currentUser.uid);
        listenForOrders(currentUser.uid);
        fetchExistingNotifications(currentUser.uid);
        
        // Load read notifications from localStorage
        const savedReadNotifications = localStorage.getItem(`readNotifications_${currentUser.uid}`);
        if (savedReadNotifications) {
          setReadNotifications(new Set(JSON.parse(savedReadNotifications)));
        }
      } else {
        setUser(null);
        setUserImage(null);
        setUserProducts([]);
        setNotifications([]);
        setReadNotifications(new Set());
      }
    });

    return () => unsubscribe();
  }, []);

  const listenForOrders = (sellerId: string) => {
    const ordersQuery = query(
        collection(db, 'orders'),
        where('sellerId', '==', sellerId)

    );
    const unsubscribeOrders = onSnapshot(ordersQuery, async (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const orderData = change.doc.data();
          // Rimuove il prodotto venduto dall'elenco dei prodotti dell'utente
          setUserProducts((prev) => prev.filter(product => product.id !== orderData.productId));

          const productDoc = await getDoc(doc(db, 'products', orderData.productId));
          const productData = productDoc.data() as Product;

          const buyerDoc = await getDoc(doc(db, 'users', orderData.buyerId));
          const buyerData = buyerDoc.data() as User;

          const newNotification: Notification = {
            id: change.doc.id,  // utilizza l'ID della modifica o un generatore di ID
            productId: orderData.productId,
            productName: productData.name,
            buyerName: buyerData.displayName || buyerData.email,
            createdAt: orderData.createdAt,
            sellerId: sellerId, // Add sellerId for querying
          };

          // Salva la notifica nella collezione "notifications"
          await setDoc(doc(db, 'notifications', newNotification.id), newNotification);

          // Aggiorna lo stato delle notifiche aggiungendo la nuova notifica in cima alla lista
          setNotifications((prev) => [newNotification, ...prev]);

          // Incrementa il contatore delle nuove notifiche solo se non è già stata letta
          if (!readNotifications.has(newNotification.id)) {
            setNewNotificationsCount((prevCount) => prevCount + 1);
          }
        }
      }
    });

    return () => unsubscribeOrders();
  };

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
        chatData.messages.forEach((message: { read: boolean; senderId: string }) => {
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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?query=${searchQuery}`);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      // Esegui la query per recuperare i prodotti dell'utente specificato
      const q = query(collection(db, "products"), where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      // Mappa i documenti recuperati per creare l'array dei prodotti
      const products: Product[] = querySnapshot.docs.map((doc) => {
        // Destruttura i dati per escludere la proprietà 'id' (se presente)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...data } = doc.data() as Product; // Rimuoviamo 'id' dai dati originali
        return {
          id: doc.id, // Aggiungiamo l'ID del documento separatamente
          ...data, // Aggiungiamo gli altri dati del prodotto
        };
      });

      // Imposta lo stato con i prodotti recuperati
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

  const fetchExistingNotifications = async (userId: string) => {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('sellerId', '==', userId)
      );
      const querySnapshot = await getDocs(notificationsQuery);
      const existingNotifications: Notification[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        existingNotifications.push({
          id: doc.id,
          productId: data.productId,
          productName: data.productName,
          buyerName: data.buyerName,
          createdAt: data.createdAt,
          sellerId: data.sellerId, // Ensure sellerId is included
        });
      });
      
      setNotifications(existingNotifications);
      
      // Calculate unread count based on read notifications
      const savedReadNotifications = localStorage.getItem(`readNotifications_${userId}`);
      if (savedReadNotifications) {
        const readIds = new Set(JSON.parse(savedReadNotifications) as string[]);
        setReadNotifications(readIds);
        const unreadCount = existingNotifications.filter(n => !readIds.has(n.id)).length;
        setNewNotificationsCount(unreadCount);
      }
    } catch (error) {
      console.error('Error fetching existing notifications:', error);
    }
  };

  return (
      <div
          className={`min-h-screen flex flex-col ${
              theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
          } transition-colors duration-300`}
      >
        {/* Header */}
        <header className="bg-gradient-to-r from-[#C4333B] to-[#41978F] text-white py-4 shadow-lg relative">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <Link href="/" className="text-3xl font-extrabold flex items-center space-x-2">
              <Image src="/logoNosfondo.png" alt="Logo" width={40} height={40} />
              <span>Target Marketplace</span>
            </Link>

            <nav className="hidden md:flex space-x-6 text-lg">
              <CategoryDropdown />
              <NavLink href="/Sellpackage/sell">Vendi</NavLink>
              <NavLink href="/Team/about">Chi Siamo</NavLink>
            </nav>

            <div className="flex items-center space-x-6">
              <UserMenu user={user} userImage={userImage} handleLogout={handleLogout} />
              <ChatNotification user={user} unreadMessagesCount={unreadMessagesCount} />
              {user && (
                  <div className="relative">
                    <button
                        onClick={() => {
                          const newShowNotifications = !showNotifications;
                          setShowNotifications(newShowNotifications);
                          
                          // If opening notifications, mark all as read and reset counter
                          if (newShowNotifications && user) {
                            const allNotificationIds = notifications.map(n => n.id);
                            const newReadNotifications = new Set([...readNotifications, ...allNotificationIds]);
                            setReadNotifications(newReadNotifications);
                            setNewNotificationsCount(0);
                            
                            // Save to localStorage
                            saveReadNotifications(user.uid, newReadNotifications);
                          }
                        }}
                        className="relative p-2 text-white hover:text-gray-200 transition-colors duration-200"
                      >
                        <Bell size={22} />
                        {newNotificationsCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                            {newNotificationsCount}
                          </span>
                        )}
                      </button>
                    {/* Notifications */}
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto transition-colors duration-300">
                          <div className="p-4 border-b border-gray-200 dark:border-gray-600">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Notifiche</h3>
                              {newNotificationsCount > 0 && (
                                <button
                                  onClick={() => {
                                    if (user) {
                                      const allNotificationIds = notifications.map(n => n.id);
                                      const newReadNotifications = new Set([...readNotifications, ...allNotificationIds]);
                                      setReadNotifications(newReadNotifications);
                                      setNewNotificationsCount(0);
                                      saveReadNotifications(user.uid, newReadNotifications);
                                    }
                                  }}
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
                                >
                                  Segna tutte come lette
                                </button>
                              )}
                            </div>
                          </div>
                          {notifications.length === 0 ? (
                              <p className="p-4 text-center text-gray-500 dark:text-gray-400">Nessuna notifica</p>
                          ) : (
                              <div className="divide-y divide-gray-200 dark:divide-gray-600">
                                {notifications.map((notification) => (
                                    <div 
                                      key={notification.id} 
                                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 cursor-pointer ${
                                        readNotifications.has(notification.id) 
                                          ? 'opacity-75' 
                                          : 'bg-blue-50 dark:bg-blue-900/10'
                                      }`}
                                      onClick={() => markNotificationAsRead(notification.id)}
                                      title={readNotifications.has(notification.id) ? "Notifica già letta" : "Clicca per segnare come letta"}
                                    >
                                      <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                            readNotifications.has(notification.id)
                                              ? 'bg-gray-100 dark:bg-gray-700'
                                              : 'bg-blue-100 dark:bg-blue-900/20'
                                          }`}>
                                            <Bell className={`w-4 h-4 ${
                                              readNotifications.has(notification.id)
                                                ? 'text-gray-500 dark:text-gray-400'
                                                : 'text-blue-600 dark:text-blue-400'
                                            }`} />
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-sm ${
                                            readNotifications.has(notification.id)
                                              ? 'text-gray-600 dark:text-gray-300'
                                              : 'text-gray-800 dark:text-gray-200'
                                          }`}>
                                            <span className="font-medium">{notification.buyerName}</span> ha fatto un&apos;offerta su{' '}
                                            <span className="font-medium">{notification.productName}</span>
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(notification.createdAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                ))}
                              </div>
                          )}
                        </div>
                    )}
                  </div>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section
            className={`py-20 ${
                theme === 'dark'
                    ? 'bg-gradient-to-r from-[#2C6D68] to-[#1A4342] text-gray-300'
                    : 'bg-gradient-to-r from-[#41978F] to-[#2C6D68] text-white'
            } transition-all duration-300`}
        >
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full p-4 rounded-full shadow-lg focus:outline-none transition-all duration-300 ease-in-out ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-gray-100 placeholder-gray-400 border border-gray-600' 
                    : 'bg-white text-black placeholder-gray-500'
                }`}
              />
              <button
                  onClick={handleSearch}
                  className="absolute right-2 top-2 bg-[#C4333B] dark:bg-red-600 text-white p-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 hover:bg-[#A62D34] dark:hover:bg-red-700"
              >
                <Search size={20} />
              </button>

              <SearchResults searchQuery={searchQuery} />
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className={`py-16 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-800'} transition-colors duration-300`}>
          <div className="container mx-auto px-4 text-center">
            <h2
                className={`text-4xl font-semibold mb-12 ${
                    theme === 'dark' ? 'text-teal-300' : 'text-gray-800'
                } transition-colors duration-300`}
            >
              Categorie in Evidenza
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <CategoryCard name="Elettronica" image="/elettronica.png" href="Viewcategoryproduct/categories/Elettronica" />
              <CategoryCard name="Moda" image="/moda.png" href="Viewcategoryproduct/categories/Moda" />
              <CategoryCard name="Arredamento" image="/arredamento.png" href="Viewcategoryproduct/categories/Arredamento" />
              <CategoryCard name="Auto e Moto" image="/auto.png" href="Viewcategoryproduct/categories/Giocattoli" />
            </div>
          </div>
        </section>

        {/* User Products Section */}
        <section className={`py-16 ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'} transition-colors duration-300`}>
          <div className="container mx-auto px-4 text-center">
            <h2
                className={`text-4xl font-semibold mb-12 ${
                    theme === 'dark' ? 'text-teal-300' : 'text-gray-800'
                } transition-colors duration-300`}
            >
              I tuoi articoli in vendita
            </h2>
            {userProducts.length === 0 ? (
                <p className="text-xl text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Non hai ancora pubblicato articoli in vendita o sono stati tutti venduti.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {userProducts
                      .filter(product => !product.sold)
                      .slice(0, 4)
                      .map((product) => (
                          <ProductCard key={product.id} product={product} onClick={() => openProductDetails(product)} />
                      ))}
                </div>
            )}
          </div>
        </section>

        {/* Product Details Modal */}
        {isModalOpen && selectedProduct && (
            <ProductModal product={selectedProduct} onClose={closeProductDetails} />
        )}
        <ThemeToggle />

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
          <CategoryLink href="/Viewcategoryproduct/categories/Elettronica">Elettronica</CategoryLink>
          <CategoryLink href="/Viewcategoryproduct/categories/Arredamento">Arredamento</CategoryLink>
          <CategoryLink href="/Viewcategoryproduct/categories/Moda">Moda</CategoryLink>
          <CategoryLink href="/Viewcategoryproduct/categories/Giocattoli">Auto e Moto</CategoryLink>
        </div>
      </div>
    </div>
);

const CategoryLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
      {children}
    </Link>
);

const UserMenu = ({
                    user,
                    userImage,
                    handleLogout,
                  }: {
  user: User | null;
  userImage: string | null;
  handleLogout: () => void;
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => setDropdownOpen(!dropdownOpen);

  return user ? (
      <div className="relative inline-block text-left">
        {/* Button to toggle dropdown */}

        <button
            onClick={toggleMenu}
            className="flex items-center space-x-2 bg-transparent border border-transparent text-white py-2 px-4 rounded-full transition-colors duration-200 hover:bg-gray-700/20 hover:border-gray-600/20"
        >
          {userImage ? (
              <Image
                  src={userImage}
                  alt="Profilo"
                  width={32}
                  height={32}
                  className="rounded-full"
              />
          ) : (
              <User size={20}/>
          )}
          <span>{user.displayName || user.email}</span>
        </button>


        {/* Dropdown menu */}
        {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 transition-colors duration-300">
              {/* Warning message */}
              <div className="p-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 bg-green-100 dark:bg-green-900/20 flex items-start">
                <div className="text-green-600 dark:text-green-400 mr-2">
                  <Smile size={20}/>
                </div>
                <span>Bentornato {user?.displayName || user?.email}!</span>
              </div>

              {/* Menu items */}
              <ul className="py-1 text-gray-700 dark:text-gray-300">
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200">
                  <ClipboardList className="mr-3 text-gray-500 dark:text-gray-400" size={18}/>
                  <Link href="/Autenticazione/ordereffettuati" className="flex-1">
                    I tuoi ordini
                  </Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200">
                  {/* Modifica qui l'icona per "I miei annunci" */}
                  <Package className="mr-3 text-gray-500 dark:text-gray-400" size={18}/>
                  <Link href="/Autenticazione/user-active-ads" className="flex-1">
                    I miei annunci
                  </Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200">
                  {/* Sostituisco "Indirizzi" con "Area utente" e cambio icona */}
                  <User className="mr-3 text-gray-500 dark:text-gray-400" size={18}/>
                  <Link href="/Autenticazione/user-area" className="flex-1">
                    Area utente
                  </Link>
                </li>
                {/* Rimosso il blocco Notifiche */}
              </ul>

              {/* Logout */}
              <div className="border-t border-gray-200">
                <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100 flex items-center"
                >
                  <LogOut className="mr-3" size={18}/>
                  <span>Esci</span>
                </button>
              </div>
            </div>
        )}
      </div>
  ) : (
      <Link href="/Autenticazione/login" className="hover:text-gray-200 transition-colors duration-200">
        Login
      </Link>
  );
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UserMenuItem = ({href, children}: { href: string; children: React.ReactNode }) => (
    <Link href={href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
      {children}
    </Link>
);

const ChatNotification = ({
                            user,
                            unreadMessagesCount,
                          }: {
  user: User | null;
  unreadMessagesCount: number;
}) => {
  const router = useRouter();
  return (
      user && (
          <div className="relative">
            <button
                onClick={() => router.push(`Messages/chat/${user.uid}`)}
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
      )
  );
};

const SearchResults = ({ searchQuery }: { searchQuery: string }) =>
    searchQuery && (
        <div className={`absolute bg-white dark:bg-gray-800 w-full shadow-lg dark:shadow-gray-900/50 rounded-lg mt-2 overflow-hidden max-h-60 transition-all duration-300 ease-in-out border dark:border-gray-600`}>
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p>Digita per cercare prodotti...</p>
          </div>
        </div>
    );

const CategoryCard = ({ name, image, href }: { name: string; image: string; href: string }) => (
    <div
        className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 rounded-lg overflow-hidden transition-all duration-500 ease-in-out hover:scale-105 hover:shadow-xl dark:hover:shadow-gray-900 transform hover:-translate-y-2"
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
        className="bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/50 rounded-lg overflow-hidden hover:shadow-xl dark:hover:shadow-gray-900 transition-shadow duration-300 cursor-pointer"
        onClick={onClick}
    >
      <div className="relative h-48">
        <Image src={product.image} alt={product.name} layout="fill" objectFit="cover" />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">{product.name}</h3>
        <p className="text-gray-500 dark:text-gray-400">{product.category}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{product.description}</p>
        <p className="text-lg font-bold text-[#C4333B] dark:text-red-400 mt-2">{product.price} €</p>
      </div>
    </div>
);

const ProductModal = ({ product, onClose }: { product: Product; onClose: () => void }) => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 max-w-lg w-full p-6 relative transition-colors duration-300">
        <button className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200" onClick={onClose}>
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
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{product.name}</h2>
          <Link
              href={`/Sellpackage/edit/${product.id}`}
              className="bg-teal-500 dark:bg-teal-600 text-white p-2 rounded-full hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors duration-200"
              title="Modifica annuncio"
          >
            <Edit size={20} />
          </Link>
        </div>

        <p className="text-gray-500 dark:text-gray-400 mb-4">{product.category}</p>
        <p className="text-gray-700 dark:text-gray-300 mb-4">{product.description}</p>
        <p className="font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Prezzo: <span className="text-[#C4333B] dark:text-red-400">{product.price} €</span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Condizione: {product.condition}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Creato il: {new Date(product.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
);