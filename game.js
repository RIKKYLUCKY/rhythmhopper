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
    if (!gameStarted || gameOver) return;
    score++;
    
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    if (player.y + player.height > GROUND_Y) {
        player.y = GROUND_Y - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    if (bgm && beatmapIndex < beatmap.length && bgm.currentTime >= beatmap[beatmapIndex]) {
        obstacles.push({
            x: canvas.width,
            y: GROUND_Y - 80,
            width: 30,
            height: 80
        });
        beatmapIndex++;
    }

    obstacles.forEach(obstacle => {
        obstacle.x -= OBSTACLE_SPEED;
    });

    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
    }

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
}

function drawReadyScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawPlayer();
    ctx.font = '30px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Click or Press Space to Start', canvas.width / 2, canvas.height / 2);
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    if (bgm) { bgm.play().catch(e => console.error("音声の再生に失敗:", e)); }
    setInterval(mainLoop, 1000 / 60);
}

// === イベントリスナー ===
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (!gameStarted) { startGame(); } else { jump(); }
    }
});
canvas.addEventListener('click', () => {
    if (!gameStarted) { startGame(); } else if (!gameOver) { jump(); }
});
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameStarted) { startGame(); } else { jump(); }
});

restartButton.addEventListener('click', () => {
    document.location.reload();
});

const GAME_URL = "https://www.rikkiblog.net/entry/rhythm_hopper"; // ★★★ 将来、必ず書き換えてください ★★★
const GAME_TITLE = "リズム・ホッパー";
const HASH_TAGS = "リズムホッパー,ブラウザゲーム";

twitterShareButton.addEventListener('click', (e) => {
    e.preventDefault();
    const text = `『${GAME_TITLE}』でスコア${score}点を獲得！`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(GAME_URL)}&hashtags=${encodeURIComponent(HASH_TAGS)}`;
    window.open(shareUrl, '_blank');
});

lineShareButton.addEventListener('click', (e) => {
    e.preventDefault();
    const text = `『${GAME_TITLE}』でスコア${score}点を獲得！あなたも挑戦してみて！\n${GAME_URL}`;
    const shareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank');
});

friendShareButton.addEventListener('click', (e) => {
    e.preventDefault();
    const text = `このリズムゲーム、ハマる！一緒にハイスコアを競おう！ #${GAME_TITLE}`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(GAME_URL)}`;
    window.open(shareUrl, '_blank');
});

// 最初に待機画面を描画
drawReadyScreen();
