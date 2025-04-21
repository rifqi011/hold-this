import { formatTimeString } from "./game.js"

// DOM elements
const globalLeaderboard = document.getElementById("global-leaderboard")
const personalLeaderboard = document.getElementById("personal-leaderboard")

// ambil semua user dengan skor tertinggi mereka saja
function getTopUserRecords() {
	const users = JSON.parse(localStorage.getItem("users") || "[]")

	// Array untuk menyimpan skor tertinggi tiap user
	const topUserRecords = []

	users.forEach((user) => {
		if (user.records && user.records.length > 0) {
			// Ambil skor tertinggi dari user
			const highestRecord = user.records.reduce((highest, current) => (current.score > highest.score ? current : highest), user.records[0])

			topUserRecords.push({
				userId: user.id,
				username: user.username,
				score: highestRecord.score,
				timestamp: highestRecord.timestamp,
			})
		}
	})

	// Urutkan berdasarkan score dari yang tertinggi
	return topUserRecords.sort((a, b) => b.score - a.score)
}

// ambil record user yang sedang login
function getCurrentUserRecords() {
	const currentUser = JSON.parse(localStorage.getItem("currentUser"))
	if (!currentUser || !currentUser.records) return []

	// urutkan score dari yang tertinggi
	return [...currentUser.records].sort((a, b) => b.score - a.score)
}

// cek apakah score masuk ke global leaderboard
function isInGlobalLeaderboard(userId) {
	const topUsers = getTopUserRecords().slice(0, 10)
	return topUsers.some((record) => record.userId === userId)
}

// Update global leaderboard
function updateGlobalLeaderboard() {
	if (!globalLeaderboard) return

	const records = getTopUserRecords()
	const top10 = records.slice(0, 10)
	const currentUser = JSON.parse(localStorage.getItem("currentUser"))

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
		if (currentUser && record.userId === currentUser.id) {
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
function updatePersonalLeaderboard() {
	if (!personalLeaderboard) return

	const records = getCurrentUserRecords()
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
function updateLeaderboards() {
	updateGlobalLeaderboard()
	updatePersonalLeaderboard()
}

// Init leaderboards
function initLeaderboards() {
	if (globalLeaderboard || personalLeaderboard) {
		updateLeaderboards()
	}
}

// Init di halaman index
if (document.getElementById("global-leaderboard") || document.getElementById("personal-leaderboard")) {
	initLeaderboards()
}

export { updateLeaderboards }
