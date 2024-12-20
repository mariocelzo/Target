import { useState, useEffect } from 'react';

type ValidationRules = {
    required?: boolean;
    pattern?: RegExp;
    minLength?: number;
};

export function useFormValidation(value: string, rules: ValidationRules): string | null {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (rules.required && !value) {
            setError('This field is required');
        } else if (rules.pattern && !rules.pattern.test(value)) {
            setError('Invalid format');
        } else if (rules.minLength && value.length < rules.minLength) {
           // setError(Must be at least ${rules.minLength} characters);
        } else {
            setError(null);
        }
    }, [value, rules]);

    return error;
}