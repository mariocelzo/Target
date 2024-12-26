'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
// Import auth and db from Firebase configuration
import { auth, db } from '@/lib/firebase'

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
console.log('Checking Firebase initialization: auth:', auth, 'db:', db)

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
            // Registrazione utente su Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
            const user = userCredential.user

 console.log('Attempting user registration:', formData)
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

            router.push('/login') // Reindirizza alla pagina di login
        } catch (error: any) {
            console.error('Errore durante la registrazione:', error.message)
            setErrors(prev => ({ ...prev, general: 'Errore durante la registrazione. Riprova più tardi.' }))
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        document.body.style.backgroundColor = '#f3f4f6'
        return () => {
            document.body.style.backgroundColor = ''
        }
    }, [])

    const formFields = [
        { name: 'fullName', label: 'Nome Completo', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'password', label: 'Password', type: 'password' },
        { name: 'confirmPassword', label: 'Conferma Password', type: 'password' },
        { name: 'dateOfBirth', label: 'Data di Nascita', type: 'date' },
        { name: 'province', label: 'Provincia', type: 'text' },
        { name: 'city', label: 'Città', type: 'text' },
        { name: 'address', label: 'Indirizzo', type: 'text' },
        { name: 'zipCode', label: 'CAP', type: 'text' },
        { name: 'phoneNumber', label: 'Numero di Telefono', type: 'tel' },
    ]

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gradient-to-br from-[#41978F] to-[#C4333B]">
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">Unisciti a Target Marketplace</h2>
                <p className="mt-2 text-center text-sm text-gray-200">Scopri offerte incredibili su articoli di seconda mano</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {formFields.map((field) => (
                            <div key={field.name}>
                                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">{field.label}</label>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type}
                                    value={formData[field.name as keyof typeof formData]}
                                    onChange={handleChange}
                                    className="w-full border px-3 py-2 rounded-md"
                                />
                                {errors[field.name] && <p className="text-red-500 text-sm">{errors[field.name]}</p>}
                            </div>
                        ))}
                        <button type="submit" className="bg-[#C4333B] text-white py-2 px-4 w-full rounded-md">{isSubmitting ? 'Registrazione...' : 'Registrati'}</button>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

