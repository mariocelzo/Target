'use client';

import { useHome } from '@/services/useHome';
import {Header} from "antd/es/layout/layout";
import {Footer} from "antd/es/modal/shared";


export default function Home() {
  const {

    searchQuery,
    searchResults,
    isLoading,
    handleSearchChange,
    handleSearch,
    userProducts,
    openProductDetails,
    closeProductDetails,
    selectedProduct,
    isModalOpen,
  } = useHome();

  return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-[#41978F] to-[#2C6D68] text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-extrabold mb-6 animate-fade-in-down">
              Trova e Vendi con Facilità!
            </h1>
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
                Cerca
              </button>
            </div>

            {/* Risultati della ricerca */}
            {isLoading ? (
                <p className="text-white mt-4">Caricamento in corso...</p>
            ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {searchResults.map((result) => (
                      <div key={result.id} className="bg-white p-4 rounded-lg shadow">
                        <h3 className="text-lg font-bold">{result.name}</h3>
                        <p className="text-sm text-gray-600">{result.description}</p>
                        <p className="text-[#41978F] font-bold">{result.price} €</p>
                      </div>
                  ))}
                </div>
            ) : (
                <p className="text-white mt-4">Nessun risultato trovato.</p>
            )}
          </div>
        </section>

        {/* User Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-semibold mb-12 text-gray-800">
              I tuoi articoli in vendita
            </h2>
            {userProducts.filter((product) => !product.sold).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {userProducts.map((product) => (
                      <div
                          key={product.id}
                          onClick={() => openProductDetails(product)}
                          className="cursor-pointer bg-white shadow rounded-lg p-4"
                      >
                        <h3 className="text-lg font-bold">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <p className="text-[#C4333B] font-bold">{product.price} €</p>
                      </div>
                  ))}
                </div>
            ) : (
                <p className="text-xl text-gray-600">
                  Non hai ancora pubblicato articoli in vendita o sono stati tutti venduti.
                </p>
            )}
          </div>
        </section>

        {/* Modal for Product Details */}
        {isModalOpen && selectedProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 md:w-1/2">
                <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                <p className="text-gray-700 my-4">{selectedProduct.description}</p>
                <p className="text-[#C4333B] font-bold">{selectedProduct.price} €</p>
                <button
                    onClick={closeProductDetails}
                    className="mt-4 bg-[#C4333B] text-white px-4 py-2 rounded-lg hover:bg-[#a82c30]"
                >
                  Chiudi
                </button>
              </div>
            </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
  );
}