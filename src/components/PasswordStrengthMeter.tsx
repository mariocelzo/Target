import { useEffect, useState } from 'react'

type PasswordStrength = 'debole' | 'media' | 'forte'

const PasswordStrengthMeter = ({ password }: { password: string }) => {
    const [strength, setStrength] = useState<PasswordStrength>('debole')

    useEffect(() => {
        const calculateStrength = (pwd: string): PasswordStrength => {
            let score = 0
            if (pwd.length >= 8) score++
            if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) score++
            if (pwd.match(/\d/)) score++
            if (pwd.match(/[^a-zA-Z\d]/)) score++

            if (score < 2) return 'debole'
            if (score < 4) return 'media'
            return 'forte'
        }

        setStrength(calculateStrength(password))
    }, [password])

    const getColor = () => {
        switch (strength) {
            case 'debole': return 'bg-red-500'
            case 'media': return 'bg-yellow-500'
            case 'forte': return 'bg-green-500'
            default: return 'bg-gray-300'
        }
    }

    return (
        <div className="mt-1">
            <div className="h-2 w-full bg-gray-200 rounded-full">
                <div
                    className={`h-full rounded-full transition-all duration-300 ${getColor()}`}
                    style={{ width: strength === 'debole' ? '33%' : strength === 'media' ? '66%' : '100%' }}
                ></div>
            </div>
            <p className="text-xs mt-1 text-gray-600 capitalize">Password {strength}</p>
        </div>
    )
}

export default PasswordStrengthMeter