'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useFormValidation } from '@/hooks/use-form-validation'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from "@/lib/firebase";

export default function LoginForm() {
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const emailError = useFormValidation(email, { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })
    const passwordError = useFormValidation(password, { required: true, minLength: 8 })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!emailError && !passwordError) {
            try {
                await signInWithEmailAndPassword(auth, email, password)
                alert("Login successful!")
                // Redirect to a protected page or dashboard here
            } catch (error) {
                console.error("Login Error:", error)
                alert("Error during login. Please try again.")
            }
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-8">
                <h2 className="text-3xl font-bold text-center text-[#C4333B] mb-6">Target</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#41978F] focus:border-[#41978F]"
                            placeholder="you@example.com"
                            onChange={e => setEmail(e.target.value)}
                        />
                        {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#41978F] focus:border-[#41978F]"
                                placeholder="••••••••"
                                onChange={e => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 flex items-center px-2"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                )}
                            </button>
                        </div>
                        {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={!!emailError || !!passwordError}
                            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                !!emailError || !!passwordError ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#41978F] hover:bg-[#357f78]'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#41978F] transition-all duration-200 flex items-center justify-center`}
                        >
                            Sign In
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
