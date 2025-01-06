import Link from 'next/link'
import Header from '../../components/Header'  // Import the Header component
<<<<<<< HEAD
import LoginForm from '../../components/ui/login-form'
=======
import LoginForm from '../../components/login-form'
>>>>>>> fd542f4ce3fbcbc43256825a7da8c19c9ecc1e96
import Footer from '../../components/Footer'  // Import the Footer component

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#C4333B] to-[#41978F] flex flex-col">
            <Header />

            <div className="flex items-center justify-center mt-12 flex-grow">
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

            <Footer />
        </div>
    )
}
