'use client';

import Image from 'next/image';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { useTeam } from '@/services/Team/teamService'; // Importa logica dal BLL

export default function About() {
    const teamMembers = useTeam(); // Ottieni i membri del team dal livello BLL

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <Header />

            {/* Main Section */}
            <main className="py-16">
                <div className="container mx-auto text-center">
                    {/* Logo */}
                    <div className="mb-8">
                        <Image
                            src="/logoNosfondo.png"
                            alt="Logo Target"
                            width={150}
                            height={150}
                            className="mx-auto"
                        />
                    </div>

                    <h1 className="text-4xl font-bold text-[#C4333B] mb-4">Chi Siamo</h1>
                    <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                        Target è la piattaforma ideale per trovare tutto ciò di cui hai bisogno, con un&apos;ampia selezione di categorie, prodotti di qualità e un&apos;esperienza utente senza pari.
                        Ci impegniamo a offrire un ambiente sicuro e intuitivo per vendere e acquistare prodotti nuovi e usati, sempre nel rispetto della qualità e della trasparenza.
                    </p>
                </div>

                {/* Team Section */}
                <section className="py-16 bg-gray-100">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-center text-[#41978F]">Il Nostro Team</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {teamMembers.map((member, index) => (
                                <div key={index} className="text-center">
                                    <div className="bg-gray-300 h-48 w-48 mx-auto rounded-full overflow-hidden">
                                        <Image
                                            src={member.img}
                                            alt={member.name}
                                            width={192}
                                            height={192}
                                            className="object-cover"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold mt-4">{member.name}</h3>
                                    <p className="text-gray-600">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-16 bg-[#41978F] text-white">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">La Nostra Mission</h2>
                        <p className="text-lg max-w-3xl mx-auto">
                            Offrire una piattaforma intuitiva, sicura e accessibile per tutti, unendo acquirenti e venditori in un ambiente affidabile e innovativo.
                        </p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}