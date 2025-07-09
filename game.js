// === 要素の取得 ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bgm = document.getElementById('bgm');

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
let gameStartTime = 0;

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

function updateGameLogic() {
    if (!gameStarted || gameOver) return;

    const elapsedTime = (performance.now() - gameStartTime) / 1000;
    score++;

    // プレイヤーの物理演算
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    if (player.y + player.height > GROUND_Y) {
        player.y = GROUND_Y - player.height;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // 譜面に合わせて障害物を生成
    if (beatmapIndex < beatmap.length && elapsedTime >= beatmap[beatmapIndex]) {
        let obstacleHeight = 80;
        if (elapsedTime > 45) {
            const highObstacleChance = 0.2 + (loopCount * 0.1);
            if (Math.random() < highObstacleChance) {
                obstacleHeight = 120;
            }
        }
        obstacles.push({
            x: canvas.width, y: GROUND_Y - obstacleHeight,
            width: 30, height: obstacleHeight
        });
        beatmapIndex++;
    }

    // 障害物の移動
    obstacles.forEach(obstacle => {
        obstacle.x -= OBSTACLE_SPEED;
    });

    // 当たり判定
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width && player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height && player.y + player.height > obstacle.y) {
            gameOver = true;
            if (bgm) bgm.pause();
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('rhythmHopperHighScore', highScore);
            }
        }
    });

    // 画面外の障害物を削除
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }
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
    if(gameStarted) ctx.fillText(`LOOP: ${loopCount + 1}`, canvas.width - 100, 30);

    // 画面中央のメッセージ
    ctx.textAlign = 'center';
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = '40px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '20px sans-serif';
        ctx.fillText(`SCORE: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Tap to Restart', canvas.width / 2, canvas.height / 2 + 40);
    } else if (!gameStarted) {
        ctx.font = '30px sans-serif';
        ctx.fillStyle = 'white';
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
    // メインの計算ループを開始
    setInterval(updateGameLogic, 1000 / 60);
}

// ▼▼▼【ここが今回のメイン！】イベントリスナーの修正 ▼▼▼
function handleInteraction() {
    if (gameOver) {
        document.location.reload();
    } else if (!gameStarted) {
        startGame();
    } else {
        jump();
    }
}

// PCとスマホ両方で動作するようにイベントを設定
canvas.addEventListener('mousedown', handleInteraction); // PCのクリック
canvas.addEventListener('touchstart', (e) => { // スマホのタップ
    e.preventDefault(); // 画面のスクロールを防ぐ
    handleInteraction();
});
document.addEventListener('keydown', (e) => { // キーボードのスペースキー
    if (e.code === 'Space') {
        e.preventDefault(); // 画面のスクロールを防ぐ
        handleInteraction();
    }
});

// === 描画を開始 ===
draw();
