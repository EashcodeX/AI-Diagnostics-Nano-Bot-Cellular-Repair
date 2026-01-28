/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#02040a",
                primary: "#00f2ff",
                secondary: "#ff003c",
                tertiary: "#fdf500",
                surface: "#0a101f",
            },
            fontFamily: {
                mono: ['"Fira Code"', 'monospace'],
            }
        },
    },
    plugins: [],
}
