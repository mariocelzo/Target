import type { Config } from "tailwindcss";


export default {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				// Colori esistenti
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				primary: {
					DEFAULT: '#41978F', // Verde Primario
					foreground: '#FFFFFF', // Testo su sfondo primario
					hover: '#357B74', // Hover verde scuro
				},
				secondary: {
					DEFAULT: '#C4333B', // Rosso Secondario
					foreground: '#FFFFFF', // Testo su sfondo secondario
					hover: '#a82c30', // Hover rosso scuro
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				muted: 'hsl(var(--muted))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: '12px', // Nuova opzione per curve più grandi
			},
			animation: {
				scroll: 'scroll 20s linear infinite',
				fadeIn: 'fadeIn 0.5s ease-in-out',
			},
			keyframes: {
				scroll: {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(-100%)' },
				},
				fadeIn: {
					'0%': { opacity: 0 },
					'100%': { opacity: 1 },
				},
			},
			screens: {
				'xs': '480px', // Aggiunto per schermi piccoli
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
			},
			zIndex: {
				'0': '0',
				'10': '10',
				'20': '20',
				'30': '30',
				'40': '40',
				'50': '50',
				'modal': '999', // Nuovo z-index per i modali
				'tooltip': '1000', // Nuovo z-index per tooltip
			},
			boxShadow: {
				soft: '0 2px 4px rgba(0, 0, 0, 0.1)',
				strong: '0 4px 8px rgba(0, 0, 0, 0.25)',
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;