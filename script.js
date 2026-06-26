// ============================================================
// 等待 DOM 完全加载
// ============================================================
document.addEventListener('DOMContentLoaded', function() {

    console.log('🔍 开始初始化校园墙...');

    // ---------- 1. 弹幕功能（纯原生实现） ----------
    const container = document.getElementById('danmaku-area');
    if (!container) {
        console.error('❌ 找不到 #danmaku-area');
        return;
    }

    // 弹幕配置
    const TRACK_COUNT = 6;
    const BULLET_DURATION = 8000;
    const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A29BFE', '#FD79A8'];

    let trackRightEdges = new Array(TRACK_COUNT).fill(0);
    const trackPositions = [];
    for (let i = 0; i < TRACK_COUNT; i++) {
        trackPositions.push((i + 0.5) / TRACK_COUNT);
    }

    function sendDanmaku(text) {
        if (!text.trim()) return;
        let trackIndex = Math.floor(Math.random() * TRACK_COUNT);
        for (let attempt = 0; attempt < 3; attempt++) {
            const candidate = (trackIndex + attempt) % TRACK_COUNT;
            const containerWidth = container.clientWidth;
            if (trackRightEdges[candidate] < containerWidth * 0.8) {
                trackIndex = candidate;
                break;
            }
        }

        const el = document.createElement('span');
        el.textContent = text;
        el.className = 'bullet-item';
        const fontSize = 20 + Math.floor(Math.random() * 16);
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        el.style.fontSize = fontSize + 'px';
        el.style.color = color;
        const topPercent = trackPositions[trackIndex] * 100;
        el.style.top = topPercent + '%';
        el.style.left = '100%';
        container.appendChild(el);

        const elWidth = el.offsetWidth || 100;
        const startTime = performance.now();
        const startLeft = 100;
        const endLeft = - (elWidth / container.clientWidth) * 100 - 10;

        function animateBullet(timestamp) {
            const progress = (timestamp - startTime) / BULLET_DURATION;
            if (progress >= 1) {
                el.remove();
                trackRightEdges[trackIndex] = 0;
                return;
            }
            const currentLeft = startLeft + (endLeft - startLeft) * progress;
            el.style.transform = `translateX(${currentLeft - 100}%)`;
            const containerWidth = container.clientWidth;
            const currentRight = containerWidth * (currentLeft / 100) + elWidth;
            trackRightEdges[trackIndex] = currentRight;
            requestAnimationFrame(animateBullet);
        }
        requestAnimationFrame(animateBullet);
    }

    document.getElementById('send-btn').addEventListener('click', function() {
        const input = document.getElementById('msg-input');
        sendDanmaku(input.value);
        input.value = '';
    });
    document.getElementById('msg-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') document.getElementById('send-btn').click();
    });

    const welcomeMsgs = ['🌸 欢迎回来', '✨ 青春不散场', '📖 莘庄中学记忆', '💖 这里永远有你的位置'];
    welcomeMsgs.forEach((msg, idx) => {
        setTimeout(() => sendDanmaku(msg), idx * 1500);
    });

    console.log('✅ 弹幕功能已启动（纯原生）');

    // ---------- 2. 献花：花朵 emoji 飘落 ----------
    document.getElementById('flower-btn').addEventListener('click', function() {
        launchFlowers();
    });

    // ---------- 3. 哭泣雨滴 ----------
    (function initRain() {
        const canvas = document.getElementById('rainCanvas');
        if (!canvas) return;
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
        const COUNT = 60;
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
        console.log('☔ 哭泣雨滴已启动');
    })();

    // ---------- 4. 花朵飘落（献花触发）----------
    let flowerDrops = [];
    let flowerAnimationId = null;

    function launchFlowers() {
        const container = document.querySelector('.container');
        if (!container) return;
        const emojis = ['🌸', '🌺', '🌹', '🌷', '🌻', '💐', '🌼', '🌸'];
        // ★★★ 修改点：花朵数量从 25~40 减少到 10~20 ★★★
        const count = 10 + Math.floor(Math.random() * 11); // 10~20朵
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
        if (!container) {
            flowerAnimationId = null;
            return;
        }
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

    console.log('🎉 校园墙加载完成！');
});