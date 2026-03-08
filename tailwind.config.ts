import type { Config } from "tailwindcss";

const config: Config = {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
			},
			colors: {
				background: "hsl(var(--background))",
				brand: {
					ink: "hsl(var(--brand-ink))",
					soft: "hsl(var(--brand-soft))",
					warm: "hsl(var(--brand-warm))",
				},
				foreground: "hsl(var(--foreground))",
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
				popover: {
					DEFAULT: "hsl(var(--popover))",
					foreground: "hsl(var(--popover-foreground))",
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				chart: {
					"1": "hsl(var(--chart-1))",
					"2": "hsl(var(--chart-2))",
					"3": "hsl(var(--chart-3))",
					"4": "hsl(var(--chart-4))",
					"5": "hsl(var(--chart-5))",
				},
			},
			boxShadow: {
				sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
				DEFAULT:
					"0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
				md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
				lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
				panel: "0 10px 25px rgba(14, 31, 53, 0.1)",
				soft: "0 2px 8px rgba(14, 31, 53, 0.08)",
				crisp: "0 1px 2px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.03)",
				"crisp-hover":
					"0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03), 0 0 0 1px rgba(0, 0, 0, 0.04)",
			},
			fontFamily: {
				body: ["var(--font-body)"],
				display: ["var(--font-display)"],
				mono: ["var(--font-mono)"],
			},
			keyframes: {
				"rise-in": {
					"0%": {
						opacity: "0",
						transform: "translateY(16px)",
					},
					"100%": {
						opacity: "1",
						transform: "translateY(0)",
					},
				},
				shine: {
					"100%": {
						transform: "translateX(150%) skewX(-20deg)",
					},
				},
				float: {
					"0%, 100%": {
						transform: "translateY(0)",
					},
					"50%": {
						transform: "translateY(-10px)",
					},
				},
			},
			animation: {
				"rise-in": "rise-in 700ms cubic-bezier(0.2, 0.65, 0.3, 1) both",
				shine: "shine 2s infinite",
				float: "float 6s ease-in-out infinite",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
};

export default config;
