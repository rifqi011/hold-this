// Auth untuk login, register, dan logout

// fungsi untuk mengecek halaman saat ini
function isPage(pageName) {
	return window.location.pathname.includes(pageName)
}

// cek user login atau belum
function isLoggedIn() {
	return localStorage.getItem("currentUser") !== null
}

// redirect ke halaman login jika user belum login
function checkAuth() {
	if (!isLoggedIn() && !isPage("login.html") && !isPage("register.html")) {
		window.location.href = "/login.html"
	}
}

// redirect ke halaman index jika user sudah login
function checkAlreadyLoggedIn() {
	if (isLoggedIn() && (isPage("login.html") || isPage("register.html"))) {
		window.location.href = "/index.html"
	}
}

// buat array di localStorage
function initUsers() {
	if (!localStorage.getItem("users")) {
		localStorage.setItem("users", JSON.stringify([]))
	}
}

// ambil semua user
function getUsers() {
	return JSON.parse(localStorage.getItem("users") || "[]")
}

// cari user berdasarkan email
function findUserByEmail(email) {
	const users = getUsers()
	return users.find((user) => user.email.toLowerCase() === email.toLowerCase())
}

// Register
function registerUser(username, email, password) {
	const users = getUsers()

	// beri error jika email sudah terdaftar
	if (findUserByEmail(email)) {
		throw new Error("Email already in use")
	}

	// Create new user
	const newUser = {
		id: Date.now().toString(),
		username,
		email,
		password,
		records: [],
	}

	// masukan user ke array localStorage
	users.push(newUser)
	localStorage.setItem("users", JSON.stringify(users))

	return newUser
}

// Login user
function loginUser(email, password) {
	const user = findUserByEmail(email)

	// cek apakah user dan password cocok
	if (!user || user.password !== password) {
		throw new Error("Invalid email or password")
	}

	// simpan data user yang sedang login
	const { password: _, ...userData } = user
	localStorage.setItem("currentUser", JSON.stringify(userData))

	return userData
}

// Logout user
function logoutUser() {
	localStorage.removeItem("currentUser")
	window.location.href = "/login.html"
}

// Setup register form handler
function setupRegisterForm() {
	const form = document.getElementById("register-form")
	const errorMessage = document.getElementById("error-message")

	if (!form) return

	form.addEventListener("submit", (e) => {
		e.preventDefault()
		errorMessage.classList.add("hidden")

		const username = document.getElementById("username").value.trim()
		const email = document.getElementById("email").value.trim()
		const password = document.getElementById("password").value
		const confirmPassword = document.getElementById("confirm-password").value

		// validasi konfirmasi password
		if (password !== confirmPassword) {
			errorMessage.textContent = "Passwords do not match"
			errorMessage.classList.remove("hidden")
			return
		}

		try {
			registerUser(username, email, password)

			// tampilkan alert
			Swal.fire({
				icon: "success",
				title: "Registration Successful",
				text: "You can now login with your credentials",
				timer: 2000,
				showConfirmButton: false,
			}).then(() => {
				window.location.href = "/login.html"
			})
		} catch (error) {
			errorMessage.textContent = error.message
			errorMessage.classList.remove("hidden")
		}
	})
}

// Setup login form handler
function setupLoginForm() {
	const form = document.getElementById("login-form")
	const errorMessage = document.getElementById("error-message")

	if (!form) return

	form.addEventListener("submit", (e) => {
		e.preventDefault()
		errorMessage.classList.add("hidden")

		const email = document.getElementById("email").value.trim()
		const password = document.getElementById("password").value

		try {
            loginUser(email, password)
            
			// tampilkan alert
			Swal.fire({
				icon: "success",
				title: "Login Successful",
				text: "You can play the game now",
				timer: 2000,
				showConfirmButton: false,
			}).then(() => {
				window.location.href = "/login.html"
			})
		} catch (error) {
			errorMessage.textContent = error.message
			errorMessage.classList.remove("hidden")
		}
	})
}

// Setup logout button
function setupLogout() {
	const logoutBtn = document.getElementById("logout-btn")
	if (logoutBtn) {
		logoutBtn.addEventListener("click", logoutUser)
	}
}

// tampikan username user yang login
function displayUsername() {
	const userDisplay = document.getElementById("user-display")
	if (userDisplay) {
		const currentUser = JSON.parse(localStorage.getItem("currentUser"))
		if (currentUser) {
			userDisplay.textContent = currentUser.username
		}
	}
}

// Initialize
function init() {
	initUsers()
	checkAuth()
	checkAlreadyLoggedIn()
	setupRegisterForm()
	setupLoginForm()
	setupLogout()
	displayUsername()
}

// Run initialization
init()

// export { isLoggedIn, loginUser, registerUser, logoutUser }
