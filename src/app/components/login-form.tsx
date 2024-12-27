'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useFormValidation } from '@/hooks/use-form-validation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const emailError = useFormValidation(email, { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
    const passwordError = useFormValidation(password, { required: true, minLength: 8 })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (emailError || passwordError) return

        try {
            await signInWithEmailAndPassword(auth, email, password)
            router.push('/') // Reindirizza alla home page dopo il login
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message) // Usa il messaggio dell'errore
            } else {
                setError('Credenziali non valide. Riprova.')
            }
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-8">
                <h2 className="text-3xl font-bold text-center text-[#C4333B] mb-6">Target</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="you@example.com"
                            onChange={e => setEmail(e.target.value)}
                        />
                        {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="••••••••"
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center px-2"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                            </button>
                        </div>
                        {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={!!emailError || !!passwordError}
                            className={`w-full py-2 px-4 border border-transparent rounded-md text-white ${
                                !!emailError || !!passwordError ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#41978F]'
                            }`}
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
