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

// === ゲームの定数・変数 (変更なし) ===
const GRAVITY = 0.5;
const JUMP_STRENGTH = -12;
const GROUND_Y = canvas.height - 50;
const OBSTACLE_SPEED = 5;
let score = 0;
let highScore = localStorage.getItem('rhythmHopperHighScore') || 0;
let gameOver = false;
let gameStarted = false;
let loopCount = 0;
let gameStartTime = 0;
const player = { x: 100, y: GROUND_Y - 50, width: 50, height: 50, velocityY: 0, isJumping: false };
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

function handleGameOver() {
    if(gameOver) return; // 複数回呼ばれるのを防ぐ
    gameOver = true;
    if (bgm) bgm.pause();
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('rhythmHopperHighScore', highScore);
    }
    // HTMLのUIに結果を反映
    finalScoreElement.textContent = score;
    finalHiscoreElement.textContent = highScore;
    resultScreen.style.display = 'flex'; // リザルト画面を表示
}

function updateGameLogic() {
    if (!gameStarted || gameOver) return;
    const elapsedTime = (performance.now() - gameStartTime) / 1000;
    score++;
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    if (player.y + player.height > GROUND_Y) {
        player.y = GROUND_Y - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }
    if (beatmapIndex < beatmap.length && elapsedTime >= beatmap[beatmapIndex]) {
        let obstacleHeight = 80;
        if (elapsedTime > 45) {
            if (Math.random() < (0.2 + loopCount * 0.1)) obstacleHeight = 120;
        }
        obstacles.push({ x: canvas.width, y: GROUND_Y - obstacleHeight, width: 30, height: obstacleHeight });
        beatmapIndex++;
    }
    obstacles.forEach(obstacle => {
        obstacle.x -= OBSTACLE_SPEED;
        if (player.x < obstacle.x + obstacle.width && player.x + player.width > obstacle.x && player.y < obstacle.y + obstacle.height && player.y + player.height > obstacle.y) {
            handleGameOver();
        }
    });
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].x + obstacles[i].width < 0) obstacles.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 地面
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(canvas.width, GROUND_Y);
    ctx.stroke();
    // プレイヤーと障害物
    ctx.fillStyle = '#3498db';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    obstacles.forEach(obstacle => {
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    // テキスト情報
    ctx.font = '20px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 10, 30);
    ctx.fillText(`HI-SCORE: ${highScore}`, 10, 60);
    if(gameStarted && !gameOver) ctx.fillText(`LOOP: ${loopCount + 1}`, canvas.width - 100, 30);
    // スタート前メッセージ
    if (!gameStarted) {
        ctx.textAlign = 'center';
        ctx.font = '30px sans-serif';
        ctx.fillText('Tap or Click to Start', canvas.width / 2, canvas.height / 2);
    }
    requestAnimationFrame(draw);
}

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    gameStartTime = performance.now();
    if (bgm) {
        bgm.play().catch(e => console.error("音声の再生に失敗:", e));
        bgm.addEventListener('timeupdate', () => {
            if (bgm.currentTime < 0.1 && beatmapIndex > 0) {
                loopCount++;
                beatmapIndex = 0;
            }
        });
    }
    setInterval(updateGameLogic, 1000 / 60);
}

// === イベントリスナー ===
const GAME_URL = "https://www.rikkiblog.net/entry/rhythm_hopper";
const GAME_TITLE = "リズム・ホッパー";
const HASH_TAGS = "リズムホッパー,ブラウザゲーム";

function handleInteraction(e) {
    e.preventDefault();
    if (!gameStarted) { startGame(); }
    else { jump(); }
}
canvas.addEventListener('mousedown', handleInteraction);
canvas.addEventListener('touchstart', handleInteraction);
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        handleInteraction();
    }
});
restartButton.addEventListener('click', () => { document.location.reload(); });
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

// === 描画を開始 ===
draw();
