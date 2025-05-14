import { auth, db } from "./firebase.js"
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore"
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

// simpan skor ke Firestore
async function saveScore(score) {
	if (!auth.currentUser) return

	try {
		const userRef = doc(db, "users", auth.currentUser.uid)
		const userDoc = await getDoc(userRef)

		if (!userDoc.exists()) {
			console.error("User document not found")
			return
		}

		const userData = userDoc.data()
		const records = userData.records || []

		// Add new record
		const newRecord = {
			score,
			timestamp: Date.now(),
		}

		// Update Firestore with the new record
		await updateDoc(userRef, {
			records: [...records, newRecord],
		})

		console.log("Score saved successfully:", newRecord)
		updateLeaderboards()
	} catch (error) {
		console.error("Error saving score:", error)
		Swal.fire({
			icon: "error",
			title: "Error",
			text: "Failed to save your score. Please try again.",
		})
	}
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
