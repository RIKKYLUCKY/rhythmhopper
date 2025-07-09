// === 要素の取得 ===
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const bgm = document.getElementById('bgm');
const friendShareButton = document.getElementById('friend-share-button');
const resultScreen = document.getElementById('result-screen');
// ... (他のUI要素取得は省略) ...

// === ゲームの状態管理 ===
let score = 0;
let highScore = localStorage.getItem('rhythmHopperHighScore') || 0;
let gameOver = false;
let gameStarted = false;
let loopCount = 0;
let gameStartTime = 0; // ▼▼▼ 追加：ゲーム内タイマーの基準時間

// === プレイヤー情報 ===
const player = { /* ...変更なし... */ };

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
    if (gameOver) return;

    // ▼▼▼【ここからが今回のメイン！】▼▼▼
    // ゲーム内タイマーで経過時間を計算 (秒単位)
    const elapsedTime = (performance.now() - gameStartTime) / 1000;

    // 譜面に合わせて障害物を生成 (音楽の再生時間ではなく、ゲーム内タイマーを参照)
    if (beatmapIndex < beatmap.length && elapsedTime >= beatmap[beatmapIndex]) {
        let obstacleHeight = 80;
        let obstacleY = GROUND_Y - obstacleHeight;
        // 曲の中盤以降で高い障害物を出現させるロジック (経過時間で判定)
        if (elapsedTime > 45) {
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
    // ▲▲▲【ここまで】▲▲▲

    score++;

    // ... (プレイヤーの物理演算は変更なし) ...
    // ... (障害物の移動、削除、当たり判定は変更なし) ...
    
    // --- 描画処理 ---
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawPlayer();
    drawObstacles();
    // ... (スコア、ハイスコア、ループ回数の描画は変更なし) ...

    requestAnimationFrame(mainLoop);
}

function drawReadyScreen() { /* ...変更なし... */ }

function startGame() {
    if (gameStarted) return;
    gameStarted = true;
    
    gameStartTime = performance.now(); // ▼▼▼ 追加：ゲーム開始時間を記録

    if (bgm) {
        bgm.loop = true;
        bgm.play().catch(e => console.error("音声の再生に失敗:", e));
    }
    
    // メインループを開始
    requestAnimationFrame(mainLoop);
}

// === イベントリスナーなど、以降のコードは変更ありません ===
// ... (変更なし) ...
