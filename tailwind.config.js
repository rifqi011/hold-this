/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./login.html", "./register.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			fontFamily: {
				figtree: ["Figtree", "sans-serif"],
			},
			colors: {
				primary: "#6228d7",
				secondary: "#0095f6",
				accent: "#03d899",
			},
			backgroundImage: {
				"gradient-game": "linear-gradient(90deg, rgba(160, 44, 255, 1) 0%, rgba(70, 210, 255, 1) 45%, rgb(3, 216, 153) 100%)",
			},
		},
	},
	plugins: [],
}
