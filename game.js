// === 要素の取得 ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bgm = document.getElementById('bgm');
const friendShareButton = document.getElementById('friend-share-button');
const resultScreen = document.getElementById('result-screen');
const finalScoreElement = document.getElementById('final-score');
const finalHiscoreElement = document.getElementById('final-hiscore');
const twitterShareButton = document.getElementById('twitter-share');
const lineShareButton = document.getElementById('line-share');
const restartButton = document.getElementById('restart-button');

// === ゲームの定数 ===
const GRAVITY = 0.5;
const JUMP_STRENGTH = -12;
const GROUND_Y = canvas.height - 50;
const OBSTACLE_SPEED = 5;

// === ゲームの状態管理 ===
let score = 0;
let highScore = localStorage.getItem('rhythmHopperHighScore') || 0;
let gameOver = false;
let gameStarted = false;
let loopCount = 0;

// === プレイヤー情報 ===
const player = {
    x: 100,
    y: GROUND_Y - 50,
    width: 50,
    height: 50,
    velocityY: 0,
    isJumping: false
};

// === 譜面と障害物 ===
const obstacles = [];
const beatmap = [];
const BPM = 140;
const beatInterval = 60 / BPM;
const musicLengthInSeconds = 180;
const totalBeats = Math.floor(musicLengthInSeconds / beatInterval);

for (let i = 1; i <= totalBeats; i++) {
    if (i % 2 === 0) {
        const timing = 2 + (i * beatInterval);
        beatmap.push(timing);
    }
}
let beatmapIndex = 0;

// === 関数定義 ===
function jump() {
    if (!player.isJumping && !gameOver) {
        player.velocityY = JUMP_STRENGTH;
        player.isJumping = true;
    }
}

function drawGround() {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();
}

function drawPlayer() {
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function handleGameOver() {
    gameOver = true;
    if (bgm) bgm.pause();

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('rhythmHopperHighScore', highScore);
    }

    finalScoreElement.textContent = score;
    finalHiscoreElement.textContent = highScore;
    resultScreen.style.display = 'flex';
}

function mainLoop() {
    if (gameOver) return; // ゲームオーバーなら以降の処理をしない

    score++;
    
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    if (player.y + player.height > GROUND_Y) {
        player.y = GROUND_Y - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    if (bgm && beatmapIndex < beatmap.length && bgm.currentTime >= beatmap[beatmapIndex]) {
        let obstacleHeight = 80;
        let obstacleY = GROUND_Y - obstacleHeight;
        if (bgm.currentTime > 45) {
            const highObstacleChance = 0.2 + (loopCount * 0.1);
            if (Math.random() < highObstacleChance) {
                obstacleHeight = 120;
                obstacleY = GROUND_Y - obstacleHeight;
            }
        }
        obstacles.push({
            x: canvas.width, y: obstacleY,
            width: 30, height: obstacleHeight
        });
        beatmapIndex++;
    }

    obstacles.forEach(obstacle => { obstacle.x -= OBSTACLE_SPEED; });
    for (let i = obstacles.length - 1; i >= 0; i--) { if (obstacles[i].x + obstacles[i].width < 0) { obstacles.splice(i, 1); } }

    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width && player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height && player.y + player.height > obstacle.y) {
            handleGameOver();
        }
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawPlayer();
    drawObstacles();
    ctx.font = '20px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 10, 30);
    ctx.fillText(`HI-SCORE: ${highScore}`, 10, 60);
    ctx.fillText(`LOOP: ${loopCount + 1}`, canvas.width - 100, 30);
    
    // requestAnimationFrameで次のフレームを予約
    requestAnimationFrame(mainLoop);
}

function drawReadyScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawPlayer();
    ctx.font = '30px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Tap to Start', canvas.width / 2, canvas.height / 2);
}

// ▼▼▼【ここからが今回のメイン！】▼▼▼
// ゲームを開始する、より確実な関数
function initGame() {
    // 一度だけ実行されるように、リスナーを解除
    canvas.removeEventListener('click', initGame);
    document.removeEventListener('keydown', initGameOnSpace);
    canvas.removeEventListener('touchstart', initGame);

    gameStarted = true;

    // 音楽を再生
    if (bgm) {
        bgm.loop = true;
        // play()はPromiseを返すので、成功してからループを開始するのが確実
        bgm.play().then(() => {
            console.log("音楽の再生に成功！");
            // 音楽が1周した時の処理
            bgm.addEventListener('timeupdate', () => {
                if (bgm.currentTime < 0.1 && beatmapIndex > 0) {
                    loopCount++;
                    beatmapIndex = 0;
                }
            });
            // メインループを開始
            requestAnimationFrame(mainLoop);
        }).catch(e => {
            console.error("音声の再生に失敗:", e);
            // 音声がなくてもゲームは開始する
            requestAnimationFrame(mainLoop);
        });
    } else {
        // BGMがない場合もゲームを開始
        requestAnimationFrame(mainLoop);
    }

    // ゲーム中の操作イベントリスナーをここから有効にする
    canvas.addEventListener('click', () => { if (!gameOver) jump(); });
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); if (!gameOver) jump(); });
    document.addEventListener('keydown', (e) => { if (e.code === 'Space' && !gameOver) jump(); });
}

function initGameOnSpace(e) {
    if (e.code === 'Space') {
        initGame();
    }
}
// ▲▲▲【ここまで】▲▲▲

// === UIボタンのイベントリスナー ===
restartButton.addEventListener('click', () => { document.location.reload(); });
// ...シェアボタンのリスナーは変更なし...


// === ゲーム開始の準備 ===
// 最初に待機画面を描画
drawReadyScreen();
// ユーザーの最初の操作でinitGameを呼び出す
canvas.addEventListener('click', initGame);
document.addEventListener('keydown', initGameOnSpace);
canvas.addEventListener('touchstart', initGame);
