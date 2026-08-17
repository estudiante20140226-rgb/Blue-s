document.addEventListener("DOMContentLoaded", () => {
    initWaveBackground();
    initParticleBackground();
});

function initWaveBackground() {
    const wc = document.getElementById('waveCanvas');
    if (!wc) return;

    const wctx = wc.getContext('2d');
    let W, H;

    function resW() {
        W = wc.width = window.innerWidth;
        H = wc.height = window.innerHeight;
    }

    resW();
    window.addEventListener('resize', resW);

    let wt = 0;

    function drawWaves() {
        wctx.clearRect(0, 0, W, H);

        const waves = [
            { amp: 40, freq: 0.01, speed: 0.5, y: H * 0.44, a: 0.05 },
            { amp: 20, freq: 0.018, speed: 0.85, y: H * 0.50, a: 0.09 },
            { amp: 55, freq: 0.007, speed: 0.35, y: H * 0.55, a: 0.04 },
            { amp: 16, freq: 0.022, speed: 1.1, y: H * 0.47, a: 0.07 },
        ];

        waves.forEach(w => {
            wctx.beginPath();
            wctx.strokeStyle = `rgba(61, 84, 160, ${w.a})`;
            wctx.lineWidth = 1.2;

            for (let x = 0; x <= W; x += 2) {
                const y = w.y + Math.sin(x * w.freq + wt * w.speed) * w.amp;

                if (x === 0) {
                    wctx.moveTo(x, y);
                } else {
                    wctx.lineTo(x, y);
                }
            }

            wctx.stroke();
        });

        const bars = 55;
        const bw = W / bars;

        for (let i = 0; i < bars; i++) {
            const bh = (Math.sin(i * 0.38 + wt * 1.1) * 0.5 + 0.5) * 70 + 8;
            const a = 0.03 + (bh / 78) * 0.045;

            wctx.fillStyle = `rgba(61, 84, 160, ${a})`;
            wctx.fillRect(i * bw + 2, H * 0.5 - bh / 2, bw - 4, bh);
        }

        wt += 0.013;
        requestAnimationFrame(drawWaves);
    }

    drawWaves();
}

function initParticleBackground() {
    const pc = document.getElementById('partCanvas');
    if (!pc) return;

    const pctx = pc.getContext('2d');

    function resP() {
        pc.width = window.innerWidth;
        pc.height = window.innerHeight;
    }

    resP();
    window.addEventListener('resize', resP);

    const NOTES = ['♩', '♪', '♫', '♬', '𝄞'];

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(init = false) {
            this.x = Math.random() * pc.width;
            this.y = init ? Math.random() * pc.height : pc.height + 20;
            this.size = 10 + Math.random() * 13;
            this.vy = 0.25 + Math.random() * 0.7;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.maxOp = 0.1 + Math.random() * 0.14;
            this.char = NOTES[Math.floor(Math.random() * NOTES.length)];
            this.life = 0;
            this.maxL = 220 + Math.random() * 280;
        }

        update() {
            this.y -= this.vy;
            this.x += this.vx + Math.sin(this.life * 0.018) * 0.3;
            this.life++;

            this.op = this.life < 50
                ? (this.life / 50) * this.maxOp
                : this.life > this.maxL - 50
                    ? ((this.maxL - this.life) / 50) * this.maxOp
                    : this.maxOp;

            if (this.life >= this.maxL) {
                this.reset();
            }
        }

        draw() {
            pctx.save();
            pctx.globalAlpha = this.op;
            pctx.fillStyle = '#3d54a0';
            pctx.font = `${this.size}px serif`;
            pctx.fillText(this.char, this.x, this.y);
            pctx.restore();
        }
    }

    const particles = [];

    for (let i = 0; i < 45; i++) {
        particles.push(new Particle());
    }

    function animPart() {
        pctx.clearRect(0, 0, pc.width, pc.height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animPart);
    }

    animPart();
}