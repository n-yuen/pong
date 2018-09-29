// PORT 3000

let express = require('express')
let bodyParser = require('body-parser')
let path = require('path')
let fs = require('fs')

let leaderboard = require('./leaderboard.json')

/* The list of the top players, hard-coded to a certain length. Included so that the list doesn't have
to be re-sorted every single time.
Currently 7 long. Change length by running function changeLength(len)*/
let top = leaderboard.top

/* Second part of the leaderboard is an object containing all players and their scores, 
even those on the leaderboard.*/
let players = leaderboard.everyone


// Setup
let app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'public'))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'))

// Should be the same as the length of top. Run changeLength(len) if you decide to change this letiable.
const lblength = 7

const port = 3000

// Load homepage
app.get('/', function (req, res) {
	res.render('index', {
		lb: top
	})
})

app.post('/score', function (req, res) {
	let reqName = req.body[0]
	let len = top.length
	let found = false
	let index
	let data
	let entry
	let action

	// Looks for name in array of top players
	for (i = 0; i < len; i++) {
		if (top[i].name == reqName) {
			top[i].score++
			entry = top[i]
			// Shifts leaderboard positions, if necessary
			if (i != 0) {
				// Finds index that the new score should be
				index = i - 1
				while (index >= 0 && top[i].score > top[index].score) {
					index--
				}
				index++
				// Shifts players up/down
				top = top.slice(0, index).concat(entry).concat(top.slice(index, i).concat(top.slice(i+1, lblength)))
				action = 'moveup'
			}else{
				action = 'increment'
				index = i
			}
			found = true
			break
		}
	}

	let score

	if (players[reqName]) {
		players[reqName]++
		score = players[reqName]
	} else {
		score = 1
		players[reqName] = 1
	}

	// If score (not on leaderboard) is high enough, put score on leaderboard
	if (score > top[lblength - 1].score && !found) {
		if (lblength > 1) {
			index = lblength - 1
			if (top[index].score < score) {
				index--
				entry = {
					"name": reqName,
					"score": score
				}
				while (index >= 0 && top[index].score < score) {
					index--
				}
				index++
				top = top.slice(0, index).concat(entry).concat(top.slice(index, lblength - 1))
				action = 'replace'
			}
		}
	}

	leaderboard.top = top
	fs.writeFile('leaderboard.json', JSON.stringify(leaderboard))
	res.set('Content-Type','text/html')
	res.send(JSON.stringify(top))
})


/* Sorts leaderboard and changes array of top players to specified length.
I haven't tested this btw so it 99% doesn't work*/
function changeLength(len) {
	players.sort(function (a, b) { return a.score - b.score })
	for (i = 0; i < len; i++) {
		let player = players[i]
		top[i] = {
			"name": player.name,
			"score": player.score
		}
	}
	fs.writeFile('leaderboard.json', JSON.stringify(leaderboard))
}

app.listen(port)