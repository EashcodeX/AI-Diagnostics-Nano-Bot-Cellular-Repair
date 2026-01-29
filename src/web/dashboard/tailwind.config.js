/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // "Clean Medical" Palette
                background: "#f8fafc", // Slate-50
                surface: "#ffffff",
                primary: "#0ea5e9", // Sky-500
                secondary: "#ef4444", // Red-500
                tertiary: "#eab308", // Yellow-500
                textMain: "#0f172a", // Slate-900
                textMuted: "#64748b", // Slate-500
                border: "#e2e8f0", // Slate-200
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'monospace'],
            },
            boxShadow: {
                'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
            }
        },
    },
    plugins: [],
}
