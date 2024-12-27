'use client'

import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Home } from 'lucide-react' // Aggiunta dell'icona Home
import { useRouter } from 'next/navigation'

export default function UserProfile() {
    const [userData, setUserData] = useState({
        fullName: '',
        email: '',
        dateOfBirth: '',
        province: '',
        city: '',
        address: '',
        zipCode: '',
        phoneNumber: '',
        bio: '',
        createdAt: null
    })
    const router = useRouter()

    // Fetch user data from Firestore
    const fetchUserData = async () => {
        try {
            const user = auth.currentUser
            if (user) {
                const userRef = doc(db, 'users', user.uid)
                const userSnap = await getDoc(userRef)
                if (userSnap.exists()) {
                    const data = userSnap.data()
                    setUserData({
                        fullName: data.fullName || '',
                        email: data.email || '',
                        dateOfBirth: data.dateOfBirth || '',
                        province: data.province || '',
                        city: data.city || '',
                        address: data.address || '',
                        zipCode: data.zipCode || '',
                        phoneNumber: data.phoneNumber || '',
                        bio: data.bio || '',
                        createdAt: (data.createdAt && typeof data.createdAt.toDate === 'function'
                                ? data.createdAt.toDate()
                                : new Date(data.createdAt)
                        ).toLocaleDateString('it-IT', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) || 'Data non disponibile'
                    })
                }
            }
        } catch (error) {
            console.error('Errore nel recupero dei dati utente:', error)
        }
    }

    useEffect(() => {
        fetchUserData()
    }, [])

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setUserData(prev => ({ ...prev, [name]: value }))
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            const user = auth.currentUser
            if (user) {
                const userRef = doc(db, 'users', user.uid)
                await updateDoc(userRef, {
                    ...userData
                })
            }
        } catch (error) {
            console.error('Errore nell aggiornamento dei dati:', error)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#41978F] to-[#2c6964] text-white p-8">
            <Card className="max-w-2xl mx-auto overflow-hidden">
                <CardHeader className="bg-[#C4333B] text-white">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Profilo Utente</h1>
                        <button
                            onClick={() => router.push('/')} // Naviga alla home page
                            className="text-white p-2 hover:bg-gray-600 rounded-full"
                        >
                            <Home className="w-6 h-6" /> {/* Icona Home */}
                        </button>
                    </div>
                    <p className="text-sm opacity-75">Modifica e visualizza le tue informazioni personali</p>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-6">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src="/placeholder.svg" alt={userData.fullName} />
                            <AvatarFallback>{userData.fullName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-2xl font-semibold text-[#C4333B]">{userData.fullName}</h2>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {Object.entries(userData).map(([key, value]) => (
                            <div key={key} className="space-y-2">
                                <Label>{key}</Label>
                                {key === 'bio' ? (
                                    <Textarea
                                        name={key}
                                        value={value ?? ''}
                                        onChange={handleInputChange}
                                        className="w-full border rounded-md text-black"
                                    />
                                ) : (
                                    <Input
                                        name={key}
                                        value={value || ''}
                                        onChange={handleInputChange}
                                        disabled={key === 'createdAt'}
                                        className="w-full border rounded-md text-black"
                                    />
                                )}
                            </div>
                        ))}
                        <Button type="submit" className="bg-[#C4333B] text-white py-2 px-4 rounded-md">
                            Salva Modifiche
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
