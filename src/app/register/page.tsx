'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        province: '',
        city: '',
        address: '',
        zipCode: '',
        phoneNumber: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.fullName.trim()) newErrors.fullName = 'Il nome completo è obbligatorio'
        if (!formData.email.trim()) newErrors.email = 'L\'email è obbligatoria'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email non valida'
        if (!formData.password) newErrors.password = 'La password è obbligatoria'
        else if (formData.password.length < 8) newErrors.password = 'La password deve essere di almeno 8 caratteri'
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Le password non corrispondono'
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'La data di nascita è obbligatoria'
        else {
            const birthDate = new Date(formData.dateOfBirth)
            const today = new Date()
            let age = today.getFullYear() - birthDate.getFullYear()
            const m = today.getMonth() - birthDate.getMonth()
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--
            }
            if (age < 18) newErrors.dateOfBirth = 'Devi avere almeno 18 anni per registrarti'
        }
        if (!formData.province.trim()) newErrors.province = 'La provincia è obbligatoria'
        if (!formData.address.trim()) newErrors.address = 'L\'indirizzo è obbligatorio'
        if (!formData.zipCode.trim()) newErrors.zipCode = 'Il CAP è obbligatorio'
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Il numero di telefono è obbligatorio'
        else if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Numero di telefono non valido'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsSubmitting(true)
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
            const user = userCredential.user

            if (!user?.uid) {
                throw new Error('ID utente non valido. Registrazione fallita.')
            }

            await setDoc(doc(db, 'users', user.uid), {
                fullName: formData.fullName,
                email: formData.email,
                dateOfBirth: formData.dateOfBirth,
                province: formData.province,
                city: formData.city,
                address: formData.address,
                zipCode: formData.zipCode,
                phoneNumber: formData.phoneNumber,
                createdAt: serverTimestamp(),
            })

            setAlert({ type: 'success', message: 'Registrazione completata con successo!' })
            setTimeout(() => router.push('/login'), 3000)
        } catch (error: unknown) {
            if (error instanceof Error) {
                // Gestisci l'errore come un'istanza di Error
                console.error('Errore durante la registrazione:', error.message);
                setAlert({ type: 'error', message: error.message || 'Errore durante la registrazione. Riprova più tardi.' });
            } else {
                // Gestisci l'errore come errore generico
                console.error('Errore sconosciuto:', error);
                setAlert({ type: 'error', message: 'Errore durante la registrazione. Riprova più tardi.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider()
        try {
            const userCredential = await signInWithPopup(auth, provider)
            const user = userCredential.user
            // Salva i dettagli utente in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                fullName: user.displayName,
                email: user.email,
                createdAt: serverTimestamp(),
            })
            router.push('/') // Redirect to home after successful sign-in
        }catch (error: unknown) {
            if (error instanceof Error) {
                // Se l'errore è un'istanza di Error, possiamo accedere alla proprietà 'message'
                console.error('Errore durante la registrazione con Google:', error.message);
            } else {
                // Se l'errore non è un'istanza di Error, trattiamo l'errore come generico
                console.error('Errore durante la registrazione con Google:', error);
            }
        }
    }

    useEffect(() => {
        document.body.style.backgroundColor = '#f3f4f6'
        return () => {
            document.body.style.backgroundColor = ''
        }
    }, [])

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-col items-center justify-center flex-grow bg-gradient-to-br from-[#41978F] to-[#C4333B]">
                <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Unisciti a Target Marketplace</h2>
                    <p className="text-center text-sm text-gray-200">Scopri offerte incredibili su articoli di seconda mano</p>
                </motion.div>

                <div className="mt-8 mb-6 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {alert && (
                            <div
                                className={`mb-4 p-3 rounded-md text-sm ${alert.type === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                                {alert.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                    {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                                    <PasswordStrengthMeter password={formData.password}/>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Conferma Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                    {errors.confirmPassword &&
                                        <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Data di Nascita</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                    {errors.dateOfBirth && <p className="text-red-500 text-sm">{errors.dateOfBirth}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Provincia</label>
                                    <input
                                        type="text"
                                        name="province"
                                        value={formData.province}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                    {errors.province && <p className="text-red-500 text-sm">{errors.province}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Indirizzo</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                    {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">CAP</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                    {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Numero di
                                        Telefono</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full border px-3 py-2 rounded-md"
                                    />
                                    {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
                                </div>

                                <button
                                    type="submit"
                                    className="bg-[#C4333B] text-white py-2 px-4 w-full rounded-md"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Registrazione...' : 'Registrati'}
                                </button>
                            </div>
                        </form>

                        <div className="mt-4 text-center">
                            <button
                                onClick={handleGoogleSignIn}
                                className="flex items-center justify-center w-full py-2 px-4 border border-transparent rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                            >
                                <img
                                    src="/google.png"
                                    alt="Google logo"
                                    className="w-5 h-5 mr-3" // Icona di Google a sinistra
                                />
                                Registrati con Google
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer/>
        </div>
    )
}