// ============================================================
// 等待 DOM 完全加载后再执行所有逻辑
// ============================================================
document.addEventListener('DOMContentLoaded', function() {

    console.log('🔍 开始初始化校园墙...');

    // ---------- 1. 弹幕功能 ----------
    const container = document.getElementById('danmaku-area');
    console.log('📦 容器 #danmaku-area:', container);

    if (!container) {
        console.error('❌ 错误：找不到 id="danmaku-area" 的元素');
        return;
    }

    // 检查 BulletJs 是否可用（注意：库可能通过全局变量暴露，也可能通过模块方式）
    let BulletJsLib = null;
    if (typeof BulletJs !== 'undefined') {
        BulletJsLib = BulletJs;
    } else if (typeof window.BulletJs !== 'undefined') {
        BulletJsLib = window.BulletJs;
    } else {
        // 尝试从全局作用域查找
        try {
            BulletJsLib = Function('return BulletJs')();
        } catch (e) {
            // 忽略
        }
    }

    if (!BulletJsLib) {
        console.error('❌ 错误：BulletJs 库未加载，请检查 CDN 链接');
        console.log('💡 提示：请确保 index.html 中正确加载了弹幕库脚本');
        // 不 return，让页面其他功能（献花、雨滴）继续工作
    } else {
        try {
            const config = {
                container: container,
                trackCount: 6,
                duration: 8000
            };
            const bullet = new BulletJsLib(config);
            console.log('✅ 弹幕库初始化成功');

            // 发送弹幕函数
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

            // 绑定发送事件
            document.getElementById('send-btn').addEventListener('click', function() {
                const input = document.getElementById('msg-input');
                sendDanmaku(input.value);
                input.value = '';
            });
            document.getElementById('msg-input').addEventListener('keydown', function(e) {
                if (e.key === 'Enter') document.getElementById('send-btn').click();
            });

            // 欢迎弹幕
            const welcomeMsgs = ['🌸 欢迎回来', '✨ 青春不散场', '📖 莘庄中学记忆', '💖 这里永远有你的位置'];
            welcomeMsgs.forEach((msg, idx) => {
                setTimeout(() => sendDanmaku(msg), idx * 1500);
            });

            // 暴露调试
            window._bullet = bullet;

        } catch (e) {
            console.error('❌ 弹幕初始化失败:', e);
        }
    }

    // ---------- 2. 献花功能 ----------
    document.getElementById('flower-btn').addEventListener('click', function() {
        // 五彩纸屑
        if (typeof confetti === 'function') {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            confetti({ particleCount: 100, spread: 60, origin: { x: 0.1, y: 0.5 } });
            confetti({ particleCount: 100, spread: 60, origin: { x: 0.9, y: 0.5 } });
        } else {
            console.warn('⚠️ confetti 库未加载，跳过纸屑效果');
        }
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

    // ---------- 4. 花朵飘落 ----------
    let flowerDrops = [];
    let flowerAnimationId = null;

    function launchFlowers() {
        const container = document.querySelector('.container');
        if (!container) return;
        const emojis = ['🌸', '🌺', '🌹', '🌷', '🌻', '💐', '🌼', '🌸'];
        const count = 25 + Math.floor(Math.random() * 16);
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
    console.log('   - 弹幕库:', typeof BulletJs !== 'undefined' ? '✔️ 已加载' : '❌ 未加载');
    console.log('   - 撒花库:', typeof confetti !== 'undefined' ? '✔️ 已加载' : '❌ 未加载');
});