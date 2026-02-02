/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'mml-dark': '#0a1512', // Very dark green/black
                'mml-card': '#112520', // Slightly lighter for cards
                'mml-accent': '#00ffa3', // Neon Green
                'mml-text': '#e0f2fe',  // Light blue-white text
            }
        },
    },
    plugins: [],
}
