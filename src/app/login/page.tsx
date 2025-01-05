import Link from 'next/link'
import Header from '../../components/Header'  // Import the Header component
import LoginForm from '../components/login-form'
import Footer from '../../components/Footer'  // Import the Footer component

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#C4333B] to-[#41978F] flex flex-col">
            {/* Include the Header here */}
            <Header />

            <div className="flex items-center justify-center mt-12 flex-grow"> {/* Add margin to make space for header */}
                <div className="w-full max-w-md px-4">
                    <LoginForm />
                    <div className="mt-6 text-center">
                        <p className="text-white">
                            Non hai un account?{' '}
                            <Link href="/register" className="font-medium text-white hover:underline">
                                Registrati
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {/* Include the Footer here */}
            <Footer />
        </div>
    )
}
