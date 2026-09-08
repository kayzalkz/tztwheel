document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wheelCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const spinButton = document.getElementById('spinButton');
    const resultOverlay = document.getElementById('resultOverlay');
    const resultText = document.getElementById('resultText');
    const indicator = document.querySelector('.indicator');

    const SIZE = canvas.width; // 640 logical pixels
    const centerX = SIZE / 2;
    const centerY = SIZE / 2;
    const radius = centerX - 14;

    let rotation = 0;
    let isSpinning = false;
    let finalPrize = null;
    let sectors = [];
    let currentTickSector = -1;
    let heartbeatTimer = null;
    let lastDelta = 0;

    // WebAudio tick/heartbeat engine (no external files needed)
    let audioCtx = null;
    function ensureAudio() {
        if (!audioCtx) {
            try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { audioCtx = null; }
        }
        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    }

    function playTick(intensity) {
        if (!audioCtx) return;
        const t = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = 620 + intensity * 500;
        gain.gain.setValueAtTime(0.045 + intensity * 0.05, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.06);
    }

    function playHeartbeat() {
        if (!audioCtx) return;
        const beat = (delay, vol) => {
            const t = audioCtx.currentTime + delay;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(70, t);
            osc.frequency.exponentialRampToValueAtTime(45, t + 0.12);
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.3);
        };
        beat(0, 0.22);
        beat(0.28, 0.14);
    }

    function playWinFanfare() {
        if (!audioCtx) return;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
        notes.forEach((freq, i) => {
            const t = audioCtx.currentTime + i * 0.14;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(t);
            osc.stop(t + 0.6);
        });
    }

    // --- Segment order ---
    function buildSegmentOrder() {
        const groups = new Map();
        prizesData.forEach(p => {
            if (!groups.has(p.amount)) groups.set(p.amount, []);
            for (let i = 0; i < p.quantity; i++) groups.get(p.amount).push(p.amount);
        });
        const amounts = [...groups.keys()].sort((a, b) => a - b);
        const order = [];
        let anyLeft = true;
        while (anyLeft) {
            anyLeft = false;
            for (const amt of amounts) {
                const g = groups.get(amt);
                if (g.length) { order.push(g.pop()); anyLeft = true; }
            }
        }
        return order;
    }
    const segmentOrder = buildSegmentOrder();

    // --- Drawing ---
    function drawWheel() {
        ctx.clearRect(0, 0, SIZE, SIZE);
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(rotation);
        ctx.translate(-centerX, -centerY);

        const segmentList = segmentOrder;
        if (segmentList.length === 0) {
            ctx.restore();
            return;
        }

        if (!isSpinning) sectors = [];

        const segmentAngle = (2 * Math.PI) / segmentList.length;
        const colors = ['#16233f', '#1d2f54', '#0f1a30'];
        const maxAmount = Math.max(...prizesData.map(p => p.amount));

        segmentList.forEach((amount, index) => {
            const startAngle = index * segmentAngle;
            const segmentEndAngle = startAngle + segmentAngle;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, segmentEndAngle);
            ctx.closePath();
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();

            if (!isSpinning) {
                sectors.push({ start: startAngle, end: segmentEndAngle, prize: amount, mid: startAngle + segmentAngle / 2 });
            }

            // Label
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const label = `MMK ${amount.toLocaleString('en-US')}`;
            const fontSize = Math.max(13, Math.min(22, radius * 0.045));
            ctx.font = `700 ${fontSize}px 'Poppins', 'Inter', sans-serif`;
            ctx.fillStyle = amount === maxAmount ? '#ffc83d' : '#dbe6ff';
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = 4;
            ctx.fillText(label, radius - 18, 0);
            ctx.restore();

            // Divider
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(centerX + radius * Math.cos(startAngle), centerY + radius * Math.sin(startAngle));
            ctx.strokeStyle = 'rgba(0, 191, 255, 0.35)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });

        // Outer rim + light bulbs
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius + 7, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0,191,255,0.8)';
        ctx.lineWidth = 6;
        ctx.stroke();

        const bulbCount = 24;
        for (let b = 0; b < bulbCount; b++) {
            const ang = (b / bulbCount) * 2 * Math.PI;
            const bx = centerX + (radius + 7) * Math.cos(ang);
            const by = centerY + (radius + 7) * Math.sin(ang);
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, 2 * Math.PI);
            ctx.fillStyle = (b + Math.floor(Date.now() / 220)) % 2 === 0 ? '#ffd76e' : '#31456e';
            ctx.fill();
        }

        // Hub (drawn last so spin button sits on top via CSS)
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.14, 0, 2 * Math.PI);
        const hubGrad = ctx.createRadialGradient(centerX - 8, centerY - 8, 4, centerX, centerY, radius * 0.14);
        hubGrad.addColorStop(0, '#2b6cff');
        hubGrad.addColorStop(1, '#0b1f52');
        ctx.fillStyle = hubGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
    }

    function idleLoop(ts) {
        if (!isSpinning) drawWheel();
        requestAnimationFrame(idleLoop);
    }

    function checkTick() {
        const pointerAngle = (1.5 * Math.PI - rotation) % (2 * Math.PI);
        const norm = (pointerAngle + 2 * Math.PI) % (2 * Math.PI);
        const idx = sectors.findIndex(s => norm >= s.start && norm < s.end);
        if (idx !== -1 && idx !== currentTickSector) {
            currentTickSector = idx;
            const speed = Math.min(1, Math.abs(lastDelta) / 0.25);
            playTick(speed);
            indicator.classList.add('kick');
            setTimeout(() => indicator.classList.remove('kick'), 70);
        }
    }

    function rotateWheel(duration) {
        isSpinning = true;
        currentTickSector = -1;
        spinButton.disabled = true;
        spinButton.textContent = 'SPINNING…';

        const totalRotations = 8 * 2 * Math.PI;
        const targetSector = sectors.find(s => s.prize === finalPrize);
        if (!targetSector) {
            console.error('Target prize not found in sectors.');
            isSpinning = false;
            spinButton.disabled = false;
            spinButton.textContent = 'SPIN NOW';
            return;
        }

        const jitter = (Math.random() - 0.5) * (targetSector.end - targetSector.start) * 0.6;
        let targetRotation = (2 * Math.PI - (targetSector.mid + jitter) + 1.5 * Math.PI) % (2 * Math.PI);
        const finalRotation = totalRotations + targetRotation;

        const start = performance.now();
        lastDelta = 0;

        function frame(now) {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / duration);

            const easeOutQuint = 1 - Math.pow(1 - progress, 5);
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const eased = 0.35 * easeOutQuint + 0.65 * easeOutExpo;

            const newRotation = eased * finalRotation;
            lastDelta = newRotation - rotation;
            rotation = newRotation;

            drawWheel();
            checkTick();

            if (progress < 1) {
                if (progress > 0.72 && progress < 0.985) {
                    heartbeatTimer = heartbeatTimer || setTimeout(() => {
                        playHeartbeat();
                        heartbeatTimer = null;
                    }, 1400);
                }
                requestAnimationFrame(frame);
            } else {
                playTick(1);
                setTimeout(showResult, 650);
            }
        }
        requestAnimationFrame(frame);
    }

    async function handleSpin() {
        if (isSpinning) return;
        ensureAudio();
        spinButton.disabled = true;

        try {
            const response = await fetch('/spin', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
            const data = await response.json();

            if (data.error) {
                resultText.textContent = `Error: ${data.error}`;
                resultOverlay.classList.remove('hidden');
                spinButton.disabled = false;
                spinButton.textContent = 'SPIN NOW';
                return;
            }

            finalPrize = data.prize;
            rotateWheel(12000);
        } catch (error) {
            console.error('Spin failed:', error);
            resultText.textContent = 'A network error occurred. Try again.';
            resultOverlay.classList.remove('hidden');
            spinButton.disabled = false;
            spinButton.textContent = 'SPIN NOW';
        }
    }

    function showResult() {
        const formatted = `MMK ${finalPrize.toLocaleString('en-US')}`;

        resultText.textContent = formatted;
        resultOverlay.classList.remove('hidden');
        spinButton.textContent = 'SPIN NOW';

        playWinFanfare();
        fireConfetti();
    }

    function fireConfetti() {
        const gold = ['#ffc83d', '#ffe08a', '#ff9d2e', '#ffffff', '#00bfff'];
        confetti({ particleCount: 160, spread: 100, origin: { y: 0.6 }, colors: gold });
        setTimeout(() => confetti({ particleCount: 120, angle: 60, spread: 80, origin: { x: 0 }, colors: gold }), 250);
        setTimeout(() => confetti({ particleCount: 120, angle: 120, spread: 80, origin: { x: 1 }, colors: gold }), 400);
        setTimeout(() => {
            const end = Date.now() + 2500;
            (function drift() {
                confetti({ particleCount: 3, startVelocity: 8, ticks: 300, origin: { x: Math.random(), y: -0.05 }, colors: gold });
                if (Date.now() < end) requestAnimationFrame(drift);
            })();
        }, 900);
    }

    drawWheel();
    requestAnimationFrame(idleLoop);
    spinButton.addEventListener('click', handleSpin);
});
