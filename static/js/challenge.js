document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('natureCanvas');

    function drawNatureScene() {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const horizon = height * .43;
        const bankTop = height * .54;

        const sky = ctx.createLinearGradient(0, 0, 0, horizon);
        sky.addColorStop(0, '#4298c5'); sky.addColorStop(.7, '#a9dced'); sky.addColorStop(1, '#e6e6c2');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(255,222,145,.92)';
        ctx.shadowColor = 'rgba(255,223,145,.65)'; ctx.shadowBlur = 42;
        ctx.beginPath(); ctx.arc(width * .83, height * .16, Math.max(28, width * .035), 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;

        const cloud = (x, y, scale) => {
            ctx.fillStyle = 'rgba(255,255,255,.7)';
            ctx.beginPath(); ctx.ellipse(x, y, 58 * scale, 17 * scale, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(x - 35 * scale, y - 7 * scale, 21 * scale, 0, Math.PI * 2); ctx.arc(x, y - 14 * scale, 28 * scale, 0, Math.PI * 2); ctx.arc(x + 31 * scale, y - 5 * scale, 20 * scale, 0, Math.PI * 2); ctx.fill();
        };
        cloud(width * .23, height * .16, 1); cloud(width * .56, height * .12, .9); cloud(width * .76, height * .2, .72);

        const hill = (x, y, w, h, color) => {
            ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x - w / 2, y); ctx.quadraticCurveTo(x - w * .2, y - h, x + w * .2, y - h * .55); ctx.quadraticCurveTo(x + w * .42, y - h * .92, x + w / 2, y); ctx.closePath(); ctx.fill();
        };
        hill(width * .12, horizon + 18, width * .55, height * .16, '#708f79');
        hill(width * .54, horizon + 10, width * .7, height * .2, '#4d8066');
        hill(width * .88, horizon + 16, width * .48, height * .18, '#8c9b7a');

        const forestY = horizon + 2;
        ctx.fillStyle = '#356d50'; ctx.fillRect(0, forestY, width, height * .075);
        const pine = (x, y, s, color) => { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x, y - 48 * s); ctx.lineTo(x - 24 * s, y); ctx.lineTo(x + 24 * s, y); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#6a4932'; ctx.fillRect(x - 3 * s, y, 6 * s, 14 * s); };
        for (let x = -20; x < width + 30; x += 28) pine(x, forestY + 16 + ((x * 7) % 18), .55 + ((x * 13) % 4) / 10, x % 3 ? '#376f50' : '#4f8b60');

        const ground = ctx.createLinearGradient(0, bankTop, 0, height); ground.addColorStop(0, '#a8d678'); ground.addColorStop(.55, '#67ad59'); ground.addColorStop(1, '#3c7d4a');
        ctx.fillStyle = ground; ctx.fillRect(0, bankTop, width, height - bankTop);
        ctx.fillStyle = '#4a9a62';
        for (let x = 12; x < width; x += 32) for (let y = bankTop + 20; y < height; y += 32) { ctx.beginPath(); ctx.arc(x + ((y * 3) % 13), y, 1.6, 0, Math.PI * 2); ctx.fill(); }

        const riverTop = horizon + 45, riverBottom = height;
        ctx.save(); ctx.beginPath(); ctx.moveTo(width * .39, riverTop); ctx.lineTo(width * .61, riverTop); ctx.lineTo(width * .84, riverBottom); ctx.lineTo(width * .16, riverBottom); ctx.closePath(); ctx.clip();
        const water = ctx.createLinearGradient(0, riverTop, 0, height); water.addColorStop(0, '#88c9ce'); water.addColorStop(.45, '#428e9f'); water.addColorStop(1, '#205d79'); ctx.fillStyle = water; ctx.fillRect(0, riverTop, width, height);
        ctx.strokeStyle = 'rgba(224,255,247,.28)'; ctx.lineWidth = 2;
        for (let y = riverTop + 20; y < height; y += 30) { const spread = (y - riverTop) * .42; ctx.beginPath(); ctx.moveTo(width / 2 - spread, y); ctx.lineTo(width / 2 + spread, y); ctx.stroke(); }
        ctx.restore();

        const tree = (x, y, s) => { ctx.fillStyle = '#65472f'; ctx.fillRect(x - 8 * s, y, 16 * s, 64 * s); ctx.fillStyle = '#2f7148'; ctx.beginPath(); ctx.arc(x, y - 20 * s, 48 * s, 0, Math.PI * 2); ctx.arc(x - 35 * s, y + 4 * s, 31 * s, 0, Math.PI * 2); ctx.arc(x + 35 * s, y + 4 * s, 32 * s, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#75ae58'; ctx.beginPath(); ctx.arc(x - 18 * s, y - 39 * s, 16 * s, 0, Math.PI * 2); ctx.arc(x + 24 * s, y - 28 * s, 13 * s, 0, Math.PI * 2); ctx.fill(); };
        tree(width * .045, height * .55, 1.45); tree(width * .16, height * .66, .62); tree(width * .955, height * .56, 1.35); tree(width * .84, height * .68, .58);
    }

    drawNatureScene();
    window.addEventListener('resize', drawNatureScene, { passive: true });

    const ITEMS = {
        farmer: { emoji: '👨‍🌾', label: 'Farmer', img: '/static/img/characters/farmer.png' },
        fox: { emoji: '🦊', label: 'Fox', img: '/static/img/characters/fox.png' },
        chicken: { emoji: '🐔', label: 'Chicken', img: '/static/img/characters/chicken.png' },
        grain: { emoji: '🌾', label: 'Grain', img: '/static/img/characters/grain.png' }
    };

    const CROSS_MS = (() => {
        const raw = getComputedStyle(document.documentElement).getPropertyValue('--cross-duration')
            || getComputedStyle(document.querySelector('.game-shell') || document.body).getPropertyValue('--cross-duration');
        const seconds = parseFloat(raw);
        return Number.isFinite(seconds) ? seconds * 1000 : 1150;
    })();

    const bankLeftEl = document.getElementById('bankLeft');
    const bankRightEl = document.getElementById('bankRight');
    const boatEl = document.getElementById('boat');
    const boatSlotsEl = document.getElementById('boatSlots');
    const crossBtn = document.getElementById('crossBtn');
    const undoBtn = document.getElementById('undoBtn');
    const resetBtn = document.getElementById('resetBtn');
    const hint = document.getElementById('challengeHint');
    const boatStatus = document.getElementById('boatStatus');
    const moveCount = document.getElementById('moveCount');
    const overlay = document.getElementById('challengeOverlay');
    const boxIcon = document.getElementById('challengeIcon');
    const boxKicker = document.getElementById('challengeKicker');
    const boxText = document.getElementById('challengeText');
    const boxSub = document.getElementById('challengeSub');
    const boxAction = document.getElementById('challengeAction');
    const infoBtn = document.getElementById('infoBtn');
    const infoSheet = document.getElementById('infoSheet');
    const infoClose = document.getElementById('infoClose');

    let state, history, locked, solved;

    function freshState() {
        return {
            banks: { left: ['farmer', 'fox', 'chicken', 'grain'], right: [] },
            boat: [],
            side: 'left',
            moves: 0
        };
    }

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function resetState() {
        state = freshState();
        history = [];
        locked = false;
        solved = false;
        render();
    }

    function pushHistory() {
        history.push(clone(state));
    }

    function makeToken(key, clickable, onClick, isBoatSeat) {
        const item = ITEMS[key];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'token token--' + key + (isBoatSeat ? ' token--boat' : '');
        btn.setAttribute('aria-label', item.label);
        
        btn.innerHTML =
            '<span class="token-shadow" aria-hidden="true"></span>' +
            '<img class="token-img" src="' + item.img + '" alt="" aria-hidden="true" ' +
            'draggable="false" onerror="this.replaceWith(Object.assign(document.createElement(\'span\'),' +
            '{className:\'token-emoji\',textContent:\'' + item.emoji + '\'}))">' +
            '<span class="token-label">' + item.label + '</span>';
             
        if (clickable) {
            btn.addEventListener('click', onClick);
        } else {
            btn.disabled = true;
        }
        return btn;
    }

    function renderBank(side) {
        const el = side === 'left' ? bankLeftEl : bankRightEl;
        el.innerHTML = '';
        
        const canLoadHere = !locked && !solved && state.side === side && state.boat.length < 2;
        
        state.banks[side].forEach(key => {
            el.appendChild(makeToken(key, canLoadHere, () => load(key)));
        });
    }

    function renderBoat() {
        boatSlotsEl.innerHTML = '';
        const canUnloadNow = !locked && !solved;
        state.boat.forEach(key => {
            boatSlotsEl.appendChild(makeToken(key, canUnloadNow, () => unload(key), true));
        });
        boatEl.classList.toggle('boat--right', state.side === 'right');
    }

    function render() {
        renderBank('left');
        renderBank('right');
        renderBoat();
        boatStatus.textContent = `🚣 ${state.side === 'left' ? 'Left' : 'Right'} Bank`;
        moveCount.textContent = state.moves;
        crossBtn.disabled = locked || solved;
        undoBtn.disabled = locked || solved || history.length === 0;
        resetBtn.disabled = locked;
    }

    function load(key) {
        if (locked || solved) return;
        if (state.boat.length >= 2) return;
        const bank = state.banks[state.side];
        const idx = bank.indexOf(key);
        if (idx === -1) return;
        pushHistory();
        bank.splice(idx, 1);
        state.boat.push(key);
        hint.textContent = `${ITEMS[key].label} is aboard.`;
        render();
    }

    function unload(key) {
        if (locked || solved) return;
        const idx = state.boat.indexOf(key);
        if (idx === -1) return;
        pushHistory();
        state.boat.splice(idx, 1);
        state.banks[state.side].push(key);
        hint.textContent = `${ITEMS[key].label} is back on the bank.`;
        render();

        if (state.side === 'right' && state.banks.right.length === 4) {
            win();
        }
    }

    function cross() {
        if (locked || solved) return;
        
        if (!state.boat.includes('farmer')) {
            hint.textContent = "The Farmer must be inside the boat to row!";
            return;
        }

        pushHistory();
        locked = true;
        const fromSide = state.side;
        render();

        boatEl.classList.add('sailing');
        boatEl.classList.toggle('boat--right', fromSide === 'left');
        hint.textContent = 'Rowing across the river…';

        setTimeout(() => {
            state.side = fromSide === 'left' ? 'right' : 'left';
            state.moves += 1;
            locked = false;
            boatEl.classList.remove('sailing');

            const bad = checkFail();
            render();

            if (bad) {
                fail(bad);
            } 
            else if (state.side === 'right' && (state.banks.right.length + state.boat.length === 4)) { 
                win();
            } else {
                hint.textContent = `Docked on the ${state.side === 'left' ? 'Left' : 'Right'} Bank. Unload or row back.`;
            }
        }, CROSS_MS);
    }

    function checkFail() {
        const aloneSide = state.side === 'left' ? 'right' : 'left'; 
        const aloneBank = state.banks[aloneSide];
        if (aloneBank.includes('fox') && aloneBank.includes('chicken')) return 'fox';
        if (aloneBank.includes('chicken') && aloneBank.includes('grain')) return 'chicken';
        return null;
    }

    function fail(type) {
        boxIcon.textContent = type === 'fox' ? '🦊' : '🐔';
        boxKicker.textContent = 'GAME OVER';
        boxText.textContent = type === 'fox' ? 'The Fox ate the Chicken!' : 'The Chicken ate the Grain!';
        boxSub.textContent = 'They can never be left alone together. Plan a different order.';
        boxAction.textContent = 'Restart Puzzle';
        boxAction.onclick = () => {
            overlay.classList.add('hidden'); // Fixed: use classList
            resetState();
            hint.textContent = 'Tap the Farmer to put him in the boat.';
        };
        overlay.classList.remove('hidden'); // Fixed: use classList
    }

    function win() {
        solved = true;
        render();
        fetch('/challenge/complete', { method: 'POST' }).catch(() => {});
        
        if (window.confetti) {
            confetti({ particleCount: 200, spread: 110, origin: { y: 0.6 } });
            setTimeout(() => confetti({ particleCount: 130, angle: 60, spread: 80, origin: { x: 0 } }), 250);
            setTimeout(() => confetti({ particleCount: 130, angle: 120, spread: 80, origin: { x: 1 } }), 420);
        }
        
        boxIcon.textContent = '🏆';
        boxKicker.textContent = 'PUZZLE SOLVED!';
        boxText.textContent = `Victory in ${state.moves} moves!`;
        boxSub.textContent = 'You proved your logic — the wheel is waiting for you.';
        boxAction.textContent = 'Continue';
        
        // Redirect strictly to the play (name selection) page
        boxAction.onclick = () => { 
            window.location.href = '/play'; 
        }; 
        
        overlay.classList.remove('hidden'); // Fixed: use classList to override !important
    }

    function undo() {
        if (locked || solved || history.length === 0) return;
        state = history.pop();
        hint.textContent = `Boat is on the ${state.side === 'left' ? 'Left' : 'Right'} Bank — undo applied.`;
        render();
    }

    crossBtn.addEventListener('click', cross);
    undoBtn.addEventListener('click', undo);
    resetBtn.addEventListener('click', () => {
        if (locked) return;
        overlay.classList.add('hidden'); // Fixed: use classList
        resetState();
        hint.textContent = 'Tap the Farmer to put him in the boat.';
    });

    if (infoBtn && infoSheet) {
        infoBtn.addEventListener('click', () => {
            infoSheet.classList.remove('hidden'); // Fixed: use classList
        });
        infoSheet.addEventListener('click', (e) => {
            if (e.target === infoSheet) infoSheet.classList.add('hidden'); // Fixed: use classList
        });
    }
    if (infoClose && infoSheet) {
        infoClose.addEventListener('click', () => {
            infoSheet.classList.add('hidden'); // Fixed: use classList
        });
    }

    resetState();
});
