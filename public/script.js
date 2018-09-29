let start = document.getElementById('start')

let gamebox = document.getElementById('game')

let p1score = document.getElementById('p1score')
let p2score = document.getElementById('p2score')

let p1input = document.getElementById('p1name')
let p2input = document.getElementById('p2name')

let gameoverlay = document.getElementById('gameoverlay')

let winner = false
let game = false

let gameOver = false

const paddleMovePerTick = 5
let ballSpeed = 4.5
const tickRate = 7
const scoreToWin = 25

// Speed increases this amount someone score (set to 1 for no increase)
const multiplierPerScore = 1.02

let ballWait = 500

// Some number representing how much the ball can bounce off the paddle
const maxAngle = Math.PI / 3

let score1 = 0
let score2 = 0

// bsea setup--------------------
let ballX = 0
let ballY = 0
let velX = ballSpeed
let velY = ballSpeed

let ball = {
  ballX: 0,
  ballY: 0,
  velX: 0,
  velY: 0
}

let scoreLeft = 0
let scoreRight = 0

let lp = document.getElementById('p1')
let rp = document.getElementById('p2')

gameoverlay.onclick = function () { startGame() }

function startGame() {
  let p1name = p1input.value
  let p2name = p2input.value

  if (p1name && p2name && p1name != '-' && p2name != '-' && p1name != p2name && !gameOver) {

    // Game setup
    let textboxes = document.getElementsByTagName('input')
    for (i = 0; i < 2; i++) {
      textboxes[i].style.display = 'none'
    }
    document.getElementById('fl1').innerHTML = p1name
    document.getElementById('fl2').innerHTML = p2name

    gameoverlay.style.visibility = 'hidden'
    let ball = document.getElementById('ball')

    // Coords representing the center of ball
    ballH = ball.clientHeight
    ballW = ball.clientWidth

    gameH = gamebox.clientHeight
    gameW = gamebox.clientWidth

    ballX = ball.offsetLeft + ball.clientWidth / 2
    ballY = ball.offsetTop + ball.clientHeight / 2

    let ballBottom = ballY + ballH / 2
    let ballRight = ballX + ballW / 2

    // Allow multiple keystrokes to register at the same time
    let keypresses = {}
    document.addEventListener('keydown', function (e) {
      keypresses[e.keyCode] = true
    }, false)
    document.addEventListener('keyup', function (e) {
      keypresses[e.keyCode] = false
    }, false)
    
    let timeElapsed = 0
    let slowBall = false

    // Running of the game
    let timer = setInterval(function () {
      if (slowBall){timeElapsed += tickRate}

      let ball = document.getElementById('ball')
      ballX = ballX + velX
      ballY = ballY + velY

      console.log(ballSpeed)
      if(slowBall){
        if (timeElapsed >= ballWait){
          velX = 2*velX
          velY = 2*velY
          slowBall = false
          timeElapsed = 0
          ballWait -= 50
        }
      }

      moveBall()

      if (keypresses[87] && p1.offsetTop > 0) { // w
        moveDiv(p1, -paddleMovePerTick)
      }
      if (keypresses[83] && p1.offsetTop + p1.clientHeight < gameH) { // s
        moveDiv(p1, paddleMovePerTick)
      }
      if (keypresses[38] && p2.offsetTop > 0) { // Up arrow
        moveDiv(p2, -paddleMovePerTick)
      }
      if (keypresses[40] && p2.offsetTop + p2.clientHeight < gameH) { // Down arrow
        moveDiv(p2, paddleMovePerTick)
      }

      function moveDiv(div, dir) {
        div.style.top = div.offsetTop + dir + 'px'
      }

      function moveBall() {
        // Ball collision physics: hitting closer to the edge of the paddle will make it bounce at a steeper angle
        if (collides(lp, ball, 'l') === true) {
          ballX = lp.offsetLeft + lp.clientWidth + 1 + ballW / 2
          velX = velX * -1
          intersectY = 1 + 2 / lp.clientHeight * (lp.offsetTop - ball.offsetTop - ballH / 2)
          velY = ballSpeed * -Math.sin(maxAngle * intersectY)
        }

        // Ball collision physics: hitting closer to the edge of the paddle will make it bounce at a steeper angle
        if (collides(rp, ball, 'r') === true) {
          ballX = rp.offsetLeft - 1 - ballW / 2
          velX = velX * -1
          intersectY = 1 + 2 / rp.clientHeight * (rp.offsetTop - ball.offsetTop - ballH / 2)
          velY = ballSpeed * 2 * -Math.sin(maxAngle * intersectY)
        }

        ballBottom = ballY + ballH / 2
        ballRight = ballX + ballW / 2

        // Bounce off bottom
        if (ballBottom > gameH) {
          ballY = gameH - ballH / 2
          velY = -1 * velY
        }

        // Score on right
        if (ballRight > gameW) {
          score1++
          document.getElementById('p1score').innerHTML = score1
          if (score1 === scoreToWin) {
            endGame([p1name])
          }
          resetBallPosition()
        }

        // Bounce off top
        if (ball.offsetTop < 0) {
          ballY = ballH / 2
          velY = velY * -1
        }

        // Score on left
        if (ball.offsetLeft < 0) {
          score2++
          document.getElementById('p2score').innerHTML = score2
          if (score2 === scoreToWin) {
            endGame([p2name])
          }
          resetBallPosition()
        }

        ball.style.left = (ballX - ballW / 2) + 'px'
        ball.style.top = (ballY - ballH / 2) + 'px'
      }

      function resetBallPosition() {
        // Put in center
        ball.style.left = '50%'
        ball.style.top = '50%'
        ballX = ball.offsetLeft + ball.clientWidth / 2
        ballY = ball.offsetTop + ball.clientHeight / 2
        // Random direction when scored
        velX = velX * -multiplierPerScore
        velY = ballSpeed * 2 * (0.5 - Math.random()) * Math.sin(maxAngle)

        // Delay after scoring goal
        if (ballWait > 0){
          slowBall = true
          velX = 0.5*velX
          velY = 0.5*velY
        }
      }

      function collides(paddle, ball, pdir) {
        if (pdir === 'l') {

          // Collision only works with the right side of the left paddle
          return (paddle.offsetLeft + paddle.clientWidth > ball.offsetLeft && ballBottom > paddle.offsetTop && ball.offsetTop < paddle.offsetTop + paddle.clientHeight)
        } else {
          // Collision only works with the left side of the right paddle
          return (paddle.offsetLeft < ball.offsetLeft + ball.clientWidth && ballBottom > paddle.offsetTop && ball.offsetTop < paddle.offsetTop + paddle.clientHeight)
        }
      }

      function endGame(playerName) {
        clearInterval(timer)
        gameoverlay.style.visibility = 'visible'
        gameoverlay.innerHTML = playerName + ' wins!'
        gameOver = true
        fetch('/score', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(playerName)
        }).then(function (res) {
          res.json().then(function (data) {
            let len = data.length
            let lbdisplay = document.getElementById('leaderboard')
            let currentdiv
            // Syncs leaderboard with the server
            for (i = 0; i < data.length; i++) {
              currentdiv = lbdisplay.childNodes[2 * i + 5]
              currentdiv.childNodes[3].innerHTML = data[i].name
              currentdiv.childNodes[5].innerHTML = data[i].score
            }
          })
        })
      }
    }, tickRate)
  }
}


