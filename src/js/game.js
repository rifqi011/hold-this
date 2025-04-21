import { updateLeaderboards } from "./leaderboard.js"

// init variabel
let startTime = 0
let elapsedTime = 0
let running = false
let animationFrame

// DOM elements
const timerButton = document.getElementById("timer-button")
const hourDisplay = document.getElementById("hour")
const minuteDisplay = document.getElementById("minute")
const secondDisplay = document.getElementById("second")
const millisecondDisplay = document.getElementById("milisecond")

// Format time
function formatTime(ms) {
	const hours = Math.floor(ms / 3600000)
	const minutes = Math.floor((ms % 3600000) / 60000)
	const seconds = Math.floor((ms % 60000) / 1000)
	const milliseconds = ms % 1000

	return {
		hours: hours.toString().padStart(2, "0"),
		minutes: minutes.toString().padStart(2, "0"),
		seconds: seconds.toString().padStart(2, "0"),
		milliseconds: milliseconds.toString().padStart(3, "0"),
	}
}

// Format time for display
function formatTimeString(ms) {
	const time = formatTime(ms)
	return `${time.hours}:${time.minutes}:${time.seconds}.${time.milliseconds}`
}

// Update timer display
function updateTimer() {
	if (running) {
		elapsedTime = Date.now() - startTime
		const formatted = formatTime(elapsedTime)

		hourDisplay.textContent = formatted.hours
		minuteDisplay.textContent = formatted.minutes
		secondDisplay.textContent = formatted.seconds
		millisecondDisplay.textContent = formatted.milliseconds

		animationFrame = requestAnimationFrame(updateTimer)
	}
}

// Start timer
function startTimer() {
	if (!running) {
		running = true
		startTime = Date.now()
		updateTimer()

		// ubah gambar tombol
		if (timerButton.querySelector("img")) {
			timerButton.querySelector("img").src = "/assets/img/buttonclicked.png"
		}
	}
}

// Stop timer dan simpan hasil/skorr
function stopTimer() {
	if (running) {
		running = false
		cancelAnimationFrame(animationFrame)

		// ubah gambar tombol
		if (timerButton.querySelector("img")) {
			timerButton.querySelector("img").src = "/assets/img/button.png"
		}

		// simpan skorr
		saveScore(elapsedTime)
	}
}

// simpan skor ke localStorage
function saveScore(score) {
	// ambil user yang login
	const currentUser = JSON.parse(localStorage.getItem("currentUser"))
	if (!currentUser) return

	// Get all users
	const users = JSON.parse(localStorage.getItem("users") || "[]")
	const userIndex = users.findIndex((user) => user.id === currentUser.id)

	if (userIndex === -1) return

	// Add record to user's records
	const user = users[userIndex]
	user.records.push({
		score,
		timestamp: Date.now(),
	})

	// Update user in users array
	users[userIndex] = user
	localStorage.setItem("users", JSON.stringify(users))

	// Update current user in localStorage
	const { password: _, ...userData } = user
	localStorage.setItem("currentUser", JSON.stringify(userData))

	// Update leaderboards
	updateLeaderboards()
}

// Setup event listeners for the button
function setupButton() {
	if (!timerButton) return

	// Mouse events
	timerButton.addEventListener("mousedown", startTimer)
	timerButton.addEventListener("mouseup", stopTimer)
	timerButton.addEventListener("mouseleave", stopTimer)

	// mobile events
	timerButton.addEventListener(
		"touchstart",
		(e) => {
			e.preventDefault()
			startTimer()
		},
		{ passive: false }
	)

	timerButton.addEventListener(
		"touchend",
		(e) => {
			e.preventDefault()
			stopTimer()
		},
		{ passive: false }
	)
}

// Init game
function initGame() {
	setupButton()
}

// jika ada elemen timer-button, jalankan initGame
if (document.getElementById("timer-button")) {
	initGame()
}

export { formatTimeString }
