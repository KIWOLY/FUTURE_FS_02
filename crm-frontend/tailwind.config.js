/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
        extend: {
            colors: {
                ink: {
                    950: "#0f172a",
                    900: "#111827",
                    800: "#1f2937",
                    700: "#374151",
                    500: "#6b7280",
                    300: "#d1d5db"
                },
                ocean: {
                    700: "#0f766e",
                    500: "#14b8a6",
                    300: "#5eead4"
                },
                sand: {
                    50: "#f8fafc",
                    100: "#f1f5f9",
                    200: "#e2e8f0"
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
