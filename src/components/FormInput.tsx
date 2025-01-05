interface FormInputProps {
    id: string;
    label: string;
    type?: 'text' | 'number' | 'textarea' | 'password' | 'email';
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    placeholder?: string;
    required?: boolean;
}

export default function FormInput({
                                      id,
                                      label,
                                      type = 'text',
                                      value,
                                      onChange,
                                      placeholder = '',
                                      required = false,
                                  }: FormInputProps) {
    return (
        <div className="space-y-2">
            <label htmlFor={id} className="block text-lg font-medium text-gray-800">
                {label}
            </label>
            {type === 'textarea' ? (
                <textarea
                    id={id}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41978F] focus:outline-none text-gray-900"
                />
            ) : (
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#41978F] focus:outline-none text-gray-900"
                />
            )}
        </div>
    );
}