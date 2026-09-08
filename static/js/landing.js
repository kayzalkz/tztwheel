document.addEventListener('DOMContentLoaded', () => {
    const landing = document.getElementById('landing');
    const stage = document.getElementById('figurineStage');
    if (!landing || !stage) return;

    const IMAGES = [
        { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png', bg: '#F4845F' },
        { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png', bg: '#6BBF7A' },
        { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png', bg: '#E882B4' },
        { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png', bg: '#6EB5FF' }
    ];

    IMAGES.forEach(i => { const im = new Image(); im.src = i.src; });

    const els = IMAGES.map(data => {
        const wrap = document.createElement('div');
        wrap.className = 'figurine';
        const img = document.createElement('img');
        img.src = data.src;
        img.alt = '';
        img.draggable = false;
        wrap.appendChild(img);
        stage.appendChild(wrap);
        return wrap;
    });

    let active = 0;
    let animating = false;
    const isMobile = () => window.innerWidth < 640;

    function styleFor(role, m) {
        if (role === 'center') return { left: '50%', bottom: m ? '22%' : '0', height: m ? '60%' : '92%', transform: `translateX(-50%) scale(${m ? 1.25 : 1.68})`, filter: 'blur(0px)', opacity: 1, zIndex: 20 };
        if (role === 'left') return { left: m ? '20%' : '30%', bottom: m ? '32%' : '12%', height: m ? '16%' : '28%', transform: 'translateX(-50%) scale(1)', filter: 'blur(2px)', opacity: 0.85, zIndex: 10 };
        if (role === 'right') return { left: m ? '80%' : '70%', bottom: m ? '32%' : '12%', height: m ? '16%' : '28%', transform: 'translateX(-50%) scale(1)', filter: 'blur(2px)', opacity: 0.85, zIndex: 10 };
        return { left: '50%', bottom: m ? '32%' : '12%', height: m ? '13%' : '22%', transform: 'translateX(-50%) scale(1)', filter: 'blur(4px)', opacity: 1, zIndex: 5 };
    }

    function apply() {
        const m = isMobile();
        els.forEach((el, i) => {
            let role;
            if (i === active) role = 'center';
            else if (i === (active + 3) % 4) role = 'left';
            else if (i === (active + 1) % 4) role = 'right';
            else role = 'back';
            Object.assign(el.style, styleFor(role, m));
        });
        landing.style.backgroundColor = IMAGES[active].bg;
    }

    function navigate() {
        if (animating) return;
        animating = true;
        active = (active + 1) % 4;
        apply();
        setTimeout(() => { animating = false; }, 650);
    }

    apply();
    window.addEventListener('resize', apply);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) setInterval(navigate, 3500);
});
