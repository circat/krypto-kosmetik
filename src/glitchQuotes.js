/**
 * LYRICS SCANNER – The Scanner Feed
 * Bernd (The Forge) – Randomization & Marquee Logic
 * Simone (The Visionary) – Technologic Aesthetic
 * Betty (The Architect) – Glitch Interactions
 */

import lyricsData from './data/lyrics.json';
import gsap from 'gsap';

export function initGlitchQuotes() {
    const container = document.getElementById('lyrics-scanner');
    if (!container) return;

    // 1. Pick 4 random lines
    const selected = [...lyricsData]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    container.innerHTML = '';

    selected.forEach((text, i) => {
        const row = document.createElement('div');
        row.className = `scanner-row row-${i + 1}`;

        // Speed variation for "nervous" feel
        const speed = 15 + Math.random() * 20;
        const direction = i % 2 === 0 ? 'left' : 'right';

        row.innerHTML = `
            <div class="scanner-marquee marquee-${direction}" style="--speed: ${speed}s">
                <div class="marquee-content">
                    <span>${text}</span> — <span>${text}</span> — <span>${text}</span> — <span>${text}</span> —
                    <span>${text}</span> — <span>${text}</span> — <span>${text}</span> — <span>${text}</span> —
                </div>
                <div class="marquee-content">
                    <span>${text}</span> — <span>${text}</span> — <span>${text}</span> — <span>${text}</span> —
                    <span>${text}</span> — <span>${text}</span> — <span>${text}</span> — <span>${text}</span> —
                </div>
            </div>
            <div class="scanner-line"></div>
        `;

        container.appendChild(row);

        // Interaction: "Heftiger Glitch" on hover
        row.addEventListener('mouseenter', () => {
            gsap.to(row, {
                skewX: (Math.random() - 0.5) * 20,
                scaleY: 1.2,
                duration: 0.1,
                repeat: -1,
                yoyo: true
            });
            row.classList.add('glitching');
        });

        row.addEventListener('mouseleave', () => {
            gsap.killTweensOf(row);
            gsap.set(row, { skewX: 0, scaleY: 1 });
            row.classList.remove('glitching');
        });
    });
}
