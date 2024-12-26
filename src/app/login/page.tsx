import LoginForm from '../components/login-form'
import Link from 'next/link'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#C4333B] to-[#41978F]">
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
    )
}