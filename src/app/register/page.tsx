'use client'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { collection, addDoc, getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'

import { auth, db as firestore } from '@/lib/firebase';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'

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
    const [currentUser, setCurrentUser] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const router = useRouter()

    useEffect(() => {
        // Connessione a Firestore Emulator durante lo sviluppo
        if (window.location.hostname === 'localhost') {
            connectFirestoreEmulator(firestore, 'localhost', 8080)  // Cambia la porta se necessario
        }

        // Verifica lo stato dell'utente loggato
        const fetchUser = async () => {
            setLoading(true)
            try {
                onAuthStateChanged(auth, (user) => {
                    if (user) {
                        setCurrentUser(user.email)
                    } else {
                        setCurrentUser(null)
                    }
                })
            } catch {
                setCurrentUser(null)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
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
        if (!formData.city.trim()) newErrors.city = 'La città è obbligatoria'
        if (!formData.address.trim()) newErrors.address = 'L\'indirizzo è obbligatorio'
        if (!formData.zipCode.trim()) newErrors.zipCode = 'Il CAP è obbligatorio'
        if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Il numero di telefono è obbligatorio'
        else if (!/^\d{10}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Numero di telefono non valido'
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (validateForm()) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
                const user = userCredential.user

                // Aggiungi i dati dell'utente nel Firestore
                await addDoc(collection(firestore, 'users'), {
                    uid: user.uid,
                    email: formData.email,
                    fullName: formData.fullName,
                    dateOfBirth: formData.dateOfBirth,
                    province: formData.province,
                    city: formData.city,
                    address: formData.address,
                    zipCode: formData.zipCode,
                    phoneNumber: formData.phoneNumber,
                    createdAt: new Date(),
                })

                alert('Registrazione completata con successo!')
                router.push('/login')
            } catch (error) {
                console.error('Errore durante la registrazione:', error)
                alert('Errore durante la registrazione. Riprova.')
            }
        } else {
            alert('Ci sono errori nella compilazione del modulo. Correggili e riprova.')
        }
    }

    if (loading) {
        return <div className="text-center text-white">Caricamento...</div>
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-[#41978F] to-[#C4333B]">
            {currentUser ? (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="sm:mx-auto sm:w-full sm:max-w-md"
                >
                    <h2 className="text-center text-2xl font-extrabold text-white">
                        Benvenuto, {currentUser}!
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-200">
                        Sei già loggato. Esci per registrarti con un altro account.
                    </p>
                    <button
                        onClick={() => setCurrentUser(null)} // Funzione di logout simulata
                        className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C4333B] hover:bg-[#A12D34]"
                    >
                        Esci
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
                >
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Form Fields */}
                            {Object.keys(formData).map((key) => (
                                <div key={key}>
                                    <label
                                        htmlFor={key}
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        {key}
                                    </label>
                                    <input
                                        id={key}
                                        name={key}
                                        type="text"
                                        value={formData[key as keyof typeof formData]}
                                        onChange={handleChange}
                                        className="appearance-none block w-full px-3 py-2 border rounded-md"
                                    />
                                    {errors[key] && <p className="text-red-500">{errors[key]}</p>}
                                </div>
                            ))}
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#C4333B] hover:bg-[#A12D34]">
                                Registrati
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </div>
    )
}