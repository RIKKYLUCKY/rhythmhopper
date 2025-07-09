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
let loopCount = 0; // ★追加：音楽のループ回数をカウント

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
function jump() { /* ...変更なし... */ }
function drawGround() { /* ...変更なし... */ }
function drawPlayer() { /* ...変更なし... */ }
function drawObstacles() { /* ...変更なし... */ }
function handleGameOver() { /* ...変更なし... */ }


function mainLoop() {
    if (!gameStarted || gameOver) return;
    score++;
    
    // ... (プレイヤーの物理演算は変更なし) ...

    // ▼▼▼【ここからが今回のメイン！】▼▼▼
    // 譜面に合わせて障害物を生成
    if (bgm && beatmapIndex < beatmap.length && bgm.currentTime >= beatmap[beatmapIndex]) {
        let obstacleHeight = 80; // 通常の障害物の高さ
        let obstacleY = GROUND_Y - obstacleHeight;

        // ★追加：曲の中盤(45秒以降)から高い障害物を出現させる
        if (bgm.currentTime > 45) {
            // ループ回数に応じて高い障害物の出現確率を上げる
            // 0周目: 20% / 1周目: 30% / 2周目: 40% ...
            const highObstacleChance = 0.2 + (loopCount * 0.1);
            if (Math.random() < highObstacleChance) {
                obstacleHeight = 120; // 高い障害物の高さ
                obstacleY = GROUND_Y - obstacleHeight;
            }
        }

        obstacles.push({
            x: canvas.width,
            y: obstacleY,
            width: 30,
            height: obstacleHeight
        });
        beatmapIndex++;
    }
    // ▲▲▲【ここまで】▲▲▲

    // ... (障害物の移動、削除、当たり判定は変更なし) ...

    // --- 描画処理 ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawPlayer();
    drawObstacles();
    ctx.font = '20px sans-serif';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 10, 30);
    ctx.fillText(`HI-SCORE: ${highScore}`, 10, 60);
    ctx.fillText(`LOOP: ${loopCount + 1}`, canvas.width - 100, 30); // ★追加：ループ回数を表示
}

function drawReadyScreen() { /* ...変更なし... */ }

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    if (bgm) {
        bgm.loop = true; // ★追加：音楽をループ再生する設定
        bgm.play().catch(e => console.error("音声の再生に失敗:", e));

        // ★追加：音楽が1周したらループ回数をカウントアップし、譜面をリセットする
        bgm.addEventListener('timeupdate', () => {
            // 再生時間がほぼ0になったら（=1周したら）
            if (bgm.currentTime < 0.1 && beatmapIndex > 0) {
                loopCount++;
                beatmapIndex = 0; // 譜面を最初からやり直す
            }
        });
    }
    setInterval(mainLoop, 1000 / 60);
}

// === イベントリスナー ===
// ... (変更なし) ...
