// src/pages/contact.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { handleContactFormSubmit } from '@/services/Team/contactService';

export default function ContactForm() {
    const [contactData, setContactData] = useState({
        name: '',
        surname: '',
        email: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setContactData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await handleContactFormSubmit(contactData);
            alert('Messaggio inviato con successo!');
            setContactData({ name: '', surname: '', email: '', message: '' });
            router.push('/');  // Reindirizza alla Home
        } catch (error) {
            console.error('Errore durante l invio del messaggio:', error);
            alert('Si è verificato un errore. Riprova più tardi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#41978F] to-[#41978F] text-white p-8">
            <Card className="max-w-2xl mx-auto overflow-hidden">
                <CardHeader className="bg-red-700 text-white">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold">Modulo di Contatto</h1>
                        <button
                            onClick={() => router.push('/')}
                            className="text-white p-2 hover:bg-gray-600 rounded-full"
                        >
                            <Home className="w-6 h-6" />
                        </button>
                    </div>
                    <p className="text-sm opacity-75">Compila il modulo per contattarci</p>
                </CardHeader>
                <CardContent className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                name="name"
                                value={contactData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full border rounded-md text-black"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="surname">Cognome</Label>
                            <Input
                                id="surname"
                                name="surname"
                                value={contactData.surname}
                                onChange={handleInputChange}
                                required
                                className="w-full border rounded-md text-black"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={contactData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full border rounded-md text-black"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Messaggio</Label>
                            <Textarea
                                id="message"
                                name="message"
                                value={contactData.message}
                                onChange={handleInputChange}
                                required
                                className="w-full border rounded-md text-black"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-red-700 text-white py-2 px-4 rounded-md"
                        >
                            {loading ? 'Invio in corso...' : 'Invia Messaggio'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
