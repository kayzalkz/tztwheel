document.addEventListener('DOMContentLoaded', () => {
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
