// ============================================================
// 1. 弹幕功能
// ============================================================
const container = document.getElementById('danmaku-area');
const config = {
    container: container,
    trackCount: 6,
    duration: 8000
};
const bullet = new BulletJs(config);

function sendDanmaku(text) {
    if (!text.trim()) return;
    const colorClass = 'color-' + Math.floor(Math.random() * 5);
    const fontSize = 20 + Math.floor(Math.random() * 16);
    const el = document.createElement('span');
    el.textContent = text;
    el.className = `bullet-item ${colorClass}`;
    el.style.fontSize = fontSize + 'px';
    bullet.shoot(el);
}

document.getElementById('send-btn').addEventListener('click', function() {
    const input = document.getElementById('msg-input');
    sendDanmaku(input.value);
    input.value = '';
});
document.getElementById('msg-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') document.getElementById('send-btn').click();
});

// ============================================================
// 2. 献花：五彩纸屑 + 花朵 emoji 飘落
// ============================================================
document.getElementById('flower-btn').addEventListener('click', function() {
    // 五彩纸屑（原有）
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    confetti({ particleCount: 100, spread: 60, origin: { x: 0.1, y: 0.5 } });
    confetti({ particleCount: 100, spread: 60, origin: { x: 0.9, y: 0.5 } });
    // 花朵飘落
    launchFlowers();
});

// ============================================================
// 3. 欢迎弹幕（页面加载后自动发送）
// ============================================================
window.addEventListener('load', function() {
    const msgs = ['🌸 欢迎回来', '✨ 青春不散场', '📖 莘庄中学记忆', '💖 这里永远有你的位置'];
    msgs.forEach((msg, idx) => setTimeout(() => sendDanmaku(msg), idx * 1500));
});

// ============================================================
// 4. 哭泣 emoji 下雨（持续背景）
// ============================================================
(function initRain() {
    const canvas = document.getElementById('rainCanvas');
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const emojis = ['😢', '😭', '🥺', '💧', '😥'];
    const drops = [];
    const COUNT = 60;   // 雨滴数量

    for (let i = 0; i < COUNT; i++) {
        drops.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: 18 + Math.random() * 18,
            speed: 1.5 + Math.random() * 2.5,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            opacity: 0.4 + Math.random() * 0.5
        });
    }

    function drawRain() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let d of drops) {
            d.y += d.speed;
            if (d.y > canvas.height + 50) {
                d.y = -50;
                d.x = Math.random() * canvas.width;
                d.emoji = emojis[Math.floor(Math.random() * emojis.length)];
                d.speed = 1.5 + Math.random() * 2.5;
                d.size = 18 + Math.random() * 18;
                d.opacity = 0.4 + Math.random() * 0.5;
            }
            ctx.font = d.size + 'px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
            ctx.globalAlpha = d.opacity;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(d.emoji, d.x, d.y);
        }
        requestAnimationFrame(drawRain);
    }
    drawRain();
})();

// ============================================================
// 5. 花朵 emoji 飘落（点击献花触发）
// ============================================================
let flowerDrops = [];
let flowerAnimationId = null;

function launchFlowers() {
    const container = document.querySelector('.container');
    const emojis = ['🌸', '🌺', '🌹', '🌷', '🌻', '💐', '🌼', '🌸'];
    const count = 25 + Math.floor(Math.random() * 16); // 25~40朵

    for (let i = 0; i < count; i++) {
        const el = document.createElement('span');
        el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        const size = 20 + Math.random() * 25;
        el.style.fontSize = size + 'px';
        el.style.position = 'absolute';
        el.style.left = Math.random() * 100 + '%';
        el.style.top = '-30px';
        el.style.pointerEvents = 'none';
        el.style.zIndex = '2';
        el.style.opacity = 0.8 + Math.random() * 0.2;
        el.style.transform = `rotate(${Math.random() * 360}deg)`;
        container.appendChild(el);

        flowerDrops.push({
            el: el,
            y: -30,
            speed: 1.5 + Math.random() * 2.5,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 8,
            opacity: 0.8 + Math.random() * 0.2
        });
    }

    if (!flowerAnimationId) {
        animateFlowers();
    }
}

function animateFlowers() {
    const container = document.querySelector('.container');
    const containerHeight = container.getBoundingClientRect().height;

    let anyActive = false;
    for (let i = flowerDrops.length - 1; i >= 0; i--) {
        const drop = flowerDrops[i];
        drop.y += drop.speed;
        drop.rotation += drop.rotationSpeed;
        const progress = drop.y / containerHeight;
        if (progress > 0.5) {
            drop.opacity = 1 - (progress - 0.5) * 1.5;
            if (drop.opacity < 0) drop.opacity = 0;
        }
        drop.el.style.transform = `translateY(${drop.y}px) rotate(${drop.rotation}deg)`;
        drop.el.style.opacity = drop.opacity;

        if (drop.y > containerHeight + 50) {
            drop.el.remove();
            flowerDrops.splice(i, 1);
        } else {
            anyActive = true;
        }
    }

    if (anyActive || flowerDrops.length > 0) {
        flowerAnimationId = requestAnimationFrame(animateFlowers);
    } else {
        flowerAnimationId = null;
    }
}