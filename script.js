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

    // ============================================================
    // 弹幕配置（所有可调参数集中在这里）
    // ============================================================
    const TRACK_COUNT = 6;                       // 轨道数量
    const BASE_SPEED_PX_PER_MS = 0.15;           // 基础速度（像素/毫秒），300px/s
    const BULLET_SPEED = 1.5;                   // 速度倍数（1.0=默认，1.5=快50%）
    const COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#A29BFE', '#FD79A8'];
    // 实际速度 = BASE_SPEED_PX_PER_MS * BULLET_SPEED
    // ============================================================

    // 每个轨道当前最右侧弹幕的右边界位置
    let trackRightEdges = new Array(TRACK_COUNT).fill(0);
    // ★ 修改：轨道位置从 5% 到 75% 均匀分布，底部预留 25% 空间，彻底避免遮挡
    const trackPositions = [];
    for (let i = 0; i < TRACK_COUNT; i++) {
        // 从 5% 到 75%，均匀分布
        const pos = 0.05 + (i / (TRACK_COUNT - 1)) * 0.70;
        trackPositions.push(pos);
    }

    /**
     * 发送一条弹幕
     * @param {string} text - 弹幕文字内容
     */
    function sendDanmaku(text) {
        if (!text.trim()) return;

        // 选择一个空闲轨道
        let trackIndex = Math.floor(Math.random() * TRACK_COUNT);
        for (let attempt = 0; attempt < 3; attempt++) {
            const candidate = (trackIndex + attempt) % TRACK_COUNT;
            const containerWidth = container.clientWidth;
            if (trackRightEdges[candidate] < containerWidth * 0.8) {
                trackIndex = candidate;
                break;
            }
        }

        // 创建弹幕元素
        const el = document.createElement('span');
        el.textContent = text;
        el.className = 'bullet-item';
        const fontSize = 20 + Math.floor(Math.random() * 16);
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        el.style.fontSize = fontSize + 'px';
        el.style.color = color;
        // 使用新的轨道位置（百分比）
        el.style.top = (trackPositions[trackIndex] * 100) + '%';
        // 初始位置：容器右侧外部（left: 100%）
        el.style.left = '100%';
        container.appendChild(el);

        // 获取元素宽度
        const elWidth = el.offsetWidth || 100;
        // 计算实际速度（像素/毫秒）
        const speed = BASE_SPEED_PX_PER_MS * BULLET_SPEED;

        // 使用 transform 进行像素级平移
        let offsetX = container.clientWidth; // 初始偏移量 = 容器宽度（右侧外）
        let lastTimestamp = performance.now();

        /**
         * 弹幕动画循环（基于固定像素速度）
         */
        function animateBullet(timestamp) {
            const delta = timestamp - lastTimestamp;
            lastTimestamp = timestamp;

            // 向左移动
            offsetX -= speed * delta;

            // 如果完全移出左侧（右边界 < 0），移除
            if (offsetX + elWidth < 0) {
                el.remove();
                trackRightEdges[trackIndex] = 0;
                return;
            }

            // 应用位移
            const relativeOffset = offsetX - container.clientWidth;
            el.style.transform = 'translateX(' + relativeOffset + 'px)';

            // 更新轨道右边界
            const containerWidth = container.clientWidth;
            const currentRight = offsetX + elWidth;
            trackRightEdges[trackIndex] = currentRight;

            requestAnimationFrame(animateBullet);
        }
        // 启动动画
        requestAnimationFrame(function(timestamp) {
            lastTimestamp = timestamp;
            animateBullet(timestamp);
        });
    }

    // ---------- 绑定发送事件 ----------
    document.getElementById('send-btn').addEventListener('click', function() {
        const input = document.getElementById('msg-input');
        sendDanmaku(input.value);
        input.value = '';
    });

    document.getElementById('msg-input').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('send-btn').click();
        }
    });

    // ---------- 欢迎弹幕 ----------
    const welcomeMsgs = ['😱 校园墙你怎么似了', '😢 我的母校乐子这块谁给我补啊', '😭 莘庄中学校园多功能墙', '🥺我还记得你'];
    welcomeMsgs.forEach(function(msg, idx) {
        setTimeout(function() {
            sendDanmaku(msg);
        }, idx * 1500);
    });

    console.log('✅ 弹幕功能已启动（固定像素速度）');
    console.log('   - 基础速度: ' + BASE_SPEED_PX_PER_MS + ' px/ms');
    console.log('   - 速度倍数: ' + BULLET_SPEED + 'x');
    console.log('   - 实际速度: ' + (BASE_SPEED_PX_PER_MS * BULLET_SPEED) + ' px/ms');
    console.log('   - 轨道范围: 5% ~ 75%（底部预留 25% 空间）');

    // ---------- 2. 献花：花朵 emoji 飘落 ----------
    document.getElementById('flower-btn').addEventListener('click', function() {
        launchFlowers();
    });

    // ---------- 3. 哭泣雨滴（Canvas 背景动画） ----------
    (function initRain() {
        const canvas = document.getElementById('rainCanvas');
        if (!canvas) return;
        var ctx = canvas.getContext('2d');

        function resizeCanvas() {
            var rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        var emojis = ['😢', '😭', '🥺', '💧', '😥'];
        var drops = [];
        var COUNT = 60;

        for (var i = 0; i < COUNT; i++) {
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
            for (var i = 0; i < drops.length; i++) {
                var d = drops[i];
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

    // ---------- 4. 花朵飘落（每次 3 朵） ----------
    var flowerDrops = [];
    var flowerAnimationId = null;

    function launchFlowers() {
        var container = document.querySelector('.container');
        if (!container) return;
        var emojis = ['🌸', '🌺', '🌹', '🌷', '🌻', '💐', '🌼', '🌸'];
        var count = 3;

        for (var i = 0; i < count; i++) {
            var el = document.createElement('span');
            el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            var size = 20 + Math.random() * 25;
            el.style.fontSize = size + 'px';
            el.style.position = 'absolute';
            el.style.left = Math.random() * 100 + '%';
            el.style.top = '-30px';
            el.style.pointerEvents = 'none';
            el.style.zIndex = '2';
            el.style.opacity = 0.8 + Math.random() * 0.2;
            el.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
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
        var container = document.querySelector('.container');
        if (!container) {
            flowerAnimationId = null;
            return;
        }
        var containerHeight = container.getBoundingClientRect().height;
        var anyActive = false;

        for (var i = flowerDrops.length - 1; i >= 0; i--) {
            var drop = flowerDrops[i];
            drop.y += drop.speed;
            drop.rotation += drop.rotationSpeed;
            var progress = drop.y / containerHeight;

            if (progress > 0.5) {
                drop.opacity = 1 - (progress - 0.5) * 1.5;
                if (drop.opacity < 0) drop.opacity = 0;
            }

            drop.el.style.transform = 'translateY(' + drop.y + 'px) rotate(' + drop.rotation + 'deg)';
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