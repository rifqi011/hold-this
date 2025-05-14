import { auth, db } from "./firebase.js"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc, collection, query, where, getDocs } from "firebase/firestore"

// Auth untuk login, register, dan logout

// fungsi untuk mengecek halaman saat ini
function isPage(pageName) {
	return window.location.pathname.includes(pageName)
}

// cek user login atau belum
function isLoggedIn() {
	return auth.currentUser !== null
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

// Create user document in Firestore with username
async function createUserDocument(user, username) {
	const userRef = doc(db, "users", user.uid)
	try {
		await setDoc(userRef, {
			username,
			email: user.email.toLowerCase(), // ensure email is lowercase
			records: [],
			id: user.uid,
			createdAt: new Date().toISOString(),
		})
		return true
	} catch (error) {
		console.error("Error creating user document:", error)
		return false
	}
}

// Add this function to check if email exists
async function isEmailRegistered(email) {
	try {
		const usersRef = collection(db, "users")
		const q = query(usersRef, where("email", "==", email.toLowerCase()))
		const querySnapshot = await getDocs(q)
		return !querySnapshot.empty
	} catch (error) {
		console.error("Error checking email:", error)
		return false // Allow registration if check fails
	}
}

// Add password validation function
function validatePassword(password) {
	if (password.length < 6) {
		throw new Error("Password must be at least 6 characters")
	}
	if (!/[A-Z]/.test(password)) {
		throw new Error("Password must contain at least 1 uppercase letter")
	}
	if (!/[0-9]/.test(password)) {
		throw new Error("Password must contain at least 1 number")
	}
}

// Register - Modified to NOT auto-login after registration
async function registerUser(username, email, password) {
	try {
		if (username.length < 3) {
			throw new Error("Username must be at least 3 characters")
		}

		validatePassword(password)

		// Check if email already exists
		if (await isEmailRegistered(email)) {
			throw new Error("Email is already registered. Please login or use a different email")
		}

		const userCredential = await createUserWithEmailAndPassword(auth, email, password)
		const user = userCredential.user

		// Create user document with the provided username
		const docCreated = await createUserDocument(user, username)
		if (!docCreated) {
			throw new Error("Failed to create user profile. Please try again")
		}

		// Sign out immediately to require manual login
		await signOut(auth)

		return {
			id: user.uid,
			username,
			email,
			records: [],
		}
	} catch (error) {
		console.error("Register error:", error)
		switch (error.code) {
			case "auth/email-already-in-use":
				throw new Error("Email is already registered. Please login or use a different email")
			case "auth/invalid-email":
				throw new Error("Invalid email format. Example: name@email.com")
			case "auth/weak-password":
				throw new Error("Password too weak. Must be at least 6 characters with letters and numbers")
			case "auth/network-request-failed":
				throw new Error("Failed to connect to server. Please check your internet connection")
			default:
				throw error
		}
	}
}

// Login user
async function loginUser(email, password) {
	try {
		const userCredential = await signInWithEmailAndPassword(auth, email, password)
		const user = userCredential.user

		const userDoc = await getDoc(doc(db, "users", user.uid))
		if (!userDoc.exists()) {
			throw new Error("User data not found.")
		}

		return userDoc.data()
	} catch (error) {
		console.error("Login error:", error)
		switch (error.code) {
			case "auth/invalid-email":
				throw new Error("Invalid email format. Example: name@email.com")
			case "auth/user-not-found":
				throw new Error("Account not found. Please check your email or register first")
			case "auth/wrong-password":
				throw new Error("Incorrect password. Please try again")
			case "auth/invalid-credential":
				throw new Error("Invalid email or password. Please check your credentials")
			case "auth/too-many-requests":
				throw new Error("Too many failed attempts. Please wait or reset your password")
			case "auth/network-request-failed":
				throw new Error("Failed to connect to server. Please check your internet connection")
			case "auth/user-disabled":
				throw new Error("This account has been disabled. Please contact support")
			default:
				throw new Error("Login failed: " + (error.message || "Please try again later"))
		}
	}
}

// Logout user
function logoutUser() {
	signOut(auth).then(() => {
		window.location.href = "/login.html"
	})
}

// Setup register form handler
function setupRegisterForm() {
	const form = document.getElementById("register-form")
	const errorMessage = document.getElementById("error-message")

	if (!form) return

	form.addEventListener("submit", async (e) => {
		e.preventDefault()
		errorMessage.classList.add("hidden")

		const username = document.getElementById("username").value.trim()
		const email = document.getElementById("email").value.trim()
		const password = document.getElementById("password").value
		const confirmPassword = document.getElementById("confirm-password").value

		// validasi konfirmasi password
		if (password !== confirmPassword) {
			errorMessage.textContent = "Passwords do not match. Please check again"
			errorMessage.classList.remove("hidden")
			return
		}

		try {
			await registerUser(username, email, password)

			// tampilkan alert
			await Swal.fire({
				icon: "success",
				title: "Registration Successful",
				text: "Please login with your newly created account",
				showConfirmButton: true,
			})
			window.location.href = "/login.html"
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

	form.addEventListener("submit", async (e) => {
		e.preventDefault()
		errorMessage.classList.add("hidden")

		const email = document.getElementById("email").value.trim()
		const password = document.getElementById("password").value

		try {
			await loginUser(email, password)

			// tampilkan alert
			await Swal.fire({
				icon: "success",
				title: "Login Successful",
				text: "You can play the game now",
				timer: 2000,
				showConfirmButton: false,
			})
			window.location.href = "/index.html"
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

// tampikan username user yang login - improved to prioritize saved username
async function displayUsername() {
	const userDisplay = document.getElementById("user-display")
	if (!userDisplay) return

	try {
		const currentUser = auth.currentUser
		if (!currentUser) {
			console.log("No authenticated user")
			return
		}

		// Get user document from Firestore
		const userRef = doc(db, "users", currentUser.uid)
		const userDoc = await getDoc(userRef)

		if (userDoc.exists()) {
			// Use the username from the document
			const userData = userDoc.data()
			userDisplay.textContent = userData.username || currentUser.email
		} else {
			// Fallback if user document doesn't exist
			userDisplay.textContent = currentUser.email
		}
	} catch (error) {
		console.error("Error in displayUsername:", error)
		userDisplay.textContent = auth.currentUser?.email || "User"
	}
}

// Add auth state observer
onAuthStateChanged(auth, async (user) => {
	console.log("Auth state changed:", user ? user.uid : "No user")
	if (user) {
		await displayUsername()
	}
	checkAuth()
	checkAlreadyLoggedIn()
})

// Initialize
function init() {
	setupRegisterForm()
	setupLoginForm()
	setupLogout()
}

// Run initialization
init()

// export { isLoggedIn, loginUser, registerUser, logoutUser }
