import { db } from '@/data/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useRouter } from 'next/navigation'

export interface Ad {
    name: string
    description: string
    price: string
    category: string
    image?: string
}

export const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setPreviewImage: React.Dispatch<React.SetStateAction<string | null>>,
    setFormData: React.Dispatch<React.SetStateAction<Ad>>
) => {
    const file = e.target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
            const base64String = reader.result as string
            setPreviewImage(base64String)
            setFormData(prev => ({ ...prev, image: base64String }))
        }
        reader.readAsDataURL(file)
    }
}

export const handleSubmit = async (
    e: React.FormEvent,
    formData: Ad,
    onSubmit: (formData: Ad) => void
) => {
    e.preventDefault()

    if (!formData.name || !formData.description || !formData.price || !formData.category) {
        alert('Tutti i campi sono obbligatori')
        return
    }

    try {
        await onSubmit(formData)
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dell\'annuncio:', error)
        alert('Si è verificato un errore. Riprova più tardi.')
    }
}

export const fetchAd = async (id: string): Promise<Ad | null> => {
    const adRef = doc(db, 'products', id)
    const adDoc = await getDoc(adRef)
    if (adDoc.exists()) {
        return adDoc.data() as Ad
    }
    return null
}

export const updateAd = async (id: string, formData: Ad): Promise<void> => {
    const adRef = doc(db, 'products', id)
    await updateDoc(adRef, { ...formData })
}
