import { db } from "./firebase.js"
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from "firebase/firestore"
import { auth } from "./firebase.js"
import { formatTimeString } from "./game.js"

// DOM elements
const globalLeaderboard = document.getElementById("global-leaderboard")
const personalLeaderboard = document.getElementById("personal-leaderboard")

// ambil semua user dengan skor tertinggi mereka saja
async function getTopUserRecords() {
	try {
		if (!auth.currentUser) {
			console.log("No authenticated user")
			return []
		}

		const users = []
		const usersRef = collection(db, "users")
		const querySnapshot = await getDocs(usersRef)

		querySnapshot.forEach((doc) => {
			const userData = doc.data()
			if (userData.records && userData.records.length > 0) {
				const highestRecord = userData.records.reduce((highest, current) => (current.score > highest.score ? current : highest), userData.records[0])
				users.push({
					userId: doc.id,
					username: userData.username,
					score: highestRecord.score,
					timestamp: highestRecord.timestamp,
				})
			}
		})

		console.log("Fetched users:", users)
		return users.sort((a, b) => b.score - a.score)
	} catch (error) {
		console.error("Error fetching top records:", error)
		return []
	}
}

// ambil record user yang sedang login
async function getCurrentUserRecords() {
	if (!auth.currentUser) return []

	const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid))
	if (!userDoc.exists()) return []

	const userData = userDoc.data()
	return [...(userData.records || [])].sort((a, b) => b.score - a.score)
}

// cek apakah score masuk ke global leaderboard
function isInGlobalLeaderboard(userId) {
	const topUsers = getTopUserRecords().slice(0, 10)
	return topUsers.some((record) => record.userId === userId)
}

// Update global leaderboard
async function updateGlobalLeaderboard() {
	if (!globalLeaderboard) return

	const records = await getTopUserRecords()
	const top10 = records.slice(0, 10)
	const currentUser = auth.currentUser

	globalLeaderboard.innerHTML = ""

	if (top10.length === 0) {
		const row = document.createElement("tr")
		row.innerHTML = `
      <td colspan="3" class="p-2 text-center text-gray-400">No records yet</td>
    `
		globalLeaderboard.appendChild(row)
		return
	}

	top10.forEach((record, index) => {
		const row = document.createElement("tr")

		// Jika ini adalah skor user yang sedang login, beri warna ungu
		if (currentUser && record.userId === currentUser.uid) {
			row.className = "bg-purple-500 bg-opacity-30"
		} else {
			row.className = index % 2 === 0 ? "bg-black bg-opacity-10" : ""
		}

		row.innerHTML = `
      <td class="p-2">${index + 1}</td>
      <td class="p-2">${record.username}</td>
      <td class="p-2 text-right font-mono">${formatTimeString(record.score)}</td>
    `
		globalLeaderboard.appendChild(row)
	})
}

// Update personal leaderboard
async function updatePersonalLeaderboard() {
	if (!personalLeaderboard) return

	const records = await getCurrentUserRecords()
	const top10 = records.slice(0, 10)

	personalLeaderboard.innerHTML = ""

	if (top10.length === 0) {
		const row = document.createElement("tr")
		row.innerHTML = `
      <td colspan="2" class="p-2 text-center text-gray-400">No records yet</td>
    `
		personalLeaderboard.appendChild(row)
		return
	}

	top10.forEach((record, index) => {
		const row = document.createElement("tr")
		row.className = index % 2 === 0 ? "bg-black bg-opacity-10" : ""
		row.innerHTML = `
      <td class="p-2">${index + 1}</td>
      <td class="p-2 text-right font-mono">${formatTimeString(record.score)}</td>
    `
		personalLeaderboard.appendChild(row)
	})
}

// Update leaderboards
async function updateLeaderboards() {
	try {
		await Promise.all([updateGlobalLeaderboard(), updatePersonalLeaderboard()])
	} catch (error) {
		console.error("Error updating leaderboards:", error)
	}
}

// Init leaderboards
async function initLeaderboards() {
	if (globalLeaderboard || personalLeaderboard) {
		// Wait for auth to be ready
		await new Promise((resolve) => {
			const unsubscribe = auth.onAuthStateChanged((user) => {
				unsubscribe()
				resolve(user)
			})
		})
		await updateLeaderboards()
	}
}

// Init di halaman index
if (document.getElementById("global-leaderboard") || document.getElementById("personal-leaderboard")) {
	initLeaderboards()
}

// Set up periodic refresh
setInterval(() => {
	if (document.getElementById("global-leaderboard") || document.getElementById("personal-leaderboard")) {
		updateLeaderboards()
	}
}, 30000) // Refresh every 30 seconds

export { updateLeaderboards }
