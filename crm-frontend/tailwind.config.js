/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                ink: {
                    950: "#0b1220",
                    900: "#111a2c",
                    800: "#1b2640",
                    700: "#2b3754",
                    500: "#5b6b83",
                    300: "#c9d1dc"
                },
                ocean: {
                    700: "#0f4c5c",
                    500: "#2a9d8f",
                    300: "#84dcc6"
                },
                sand: {
                    50: "#f5f7fb",
                    100: "#e8eef6",
                    200: "#d7e0ee"
                }
            },
            fontFamily: {
                display: ["'Fraunces'", "serif"],
                body: ["'IBM Plex Sans'", "system-ui", "sans-serif"]
            },
            boxShadow: {
                card: "0 20px 40px -30px rgba(15, 23, 42, 0.35)"
            }
        }
    },
    plugins: []
}
