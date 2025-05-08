import { defineConfig } from "vite"
import path from "path"

export default defineConfig({
	root: ".", // Root proyek (default sudah '.')
	build: {
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, "index.html"),
				login: path.resolve(__dirname, "login.html"),
				register: path.resolve(__dirname, "register.html"),
			},
		},
	},
	server: {
		open: "/index.html", // default halaman saat `vite` dijalankan
	},
})
