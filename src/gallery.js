/**
 * GALLERY – The Shattered Grid
 * Bernd (The Forge) – Performance & Logic
 * Simone (The Visionary) – Asymmetric Design
 * Betty (The Architect) – Parallax Interactivity
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ALL_IMAGES = [
    '/pics/DSCF2969-8.jpg',
    '/pics/DSCF3792.jpg',
    '/pics/DSCF3800-Enhanced-NR.jpg',
    '/pics/DSCF3801-Enhanced-NR.jpg',
    '/pics/DSCF3805.jpg',
    '/pics/DSCF3807-Enhanced-NR.jpg',
    '/pics/DSCF3812-Enhanced-NR.jpg',
    '/pics/DSCF3827.jpg',
    '/pics/DSCF3829.jpg',
    '/pics/DSCF3833.jpg',
    '/pics/DSCF3835.jpg',
    '/pics/DSCF3836.jpg',
    '/pics/DSCF3850.jpg',
    '/pics/DSCF3851-Enhanced-NR.jpg',
    '/pics/DSCF3853-Enhanced-NR.jpg',
    '/pics/DSCF3854.jpg',
    '/pics/DSCF3864-Enhanced-NR.jpg',
    '/pics/DSCF3865-Enhanced-NR.jpg',
    '/pics/DSCF3866-Enhanced-NR.jpg',
    '/pics/DSCF3873-2.jpg',
    '/pics/DSCF3875-Enhanced-NR.jpg',
    '/pics/DSCF3876-Enhanced-NR.jpg',
    '/pics/DSCF3879.jpg',
    '/pics/DSCF3880.jpg',
    '/pics/DSCF3882-Enhanced-NR.jpg',
    '/pics/DSCF3884-Enhanced-NR.jpg',
    '/pics/DSCF3885-Enhanced-NR.jpg',
    '/pics/DSCF3886-Enhanced-NR.jpg',
    '/pics/DSCF3887.jpg',
    '/pics/DSCF3907-Enhanced-NR.jpg',
    '/pics/DSCF3908-Enhanced-NR.jpg',
    '/pics/DSCF3909-Enhanced-NR.jpg',
    '/pics/DSCF3910-Enhanced-NR.jpg',
    '/pics/DSCF3911-Enhanced-NR.jpg',
    '/pics/DSCF3915-Enhanced-NR.jpg',
    '/pics/DSCF3919-Enhanced-NR.jpg',
    '/pics/DSCF3920-Enhanced-NR.jpg',
    '/pics/DSCF3924.jpg',
    '/pics/DSCF3926-Enhanced-NR.jpg',
    '/pics/DSCF3935-Enhanced-NR.jpg',
    '/pics/DSCF3936-Enhanced-NR.jpg',
    '/pics/DSCF4017-Enhanced-NR.jpg',
    '/pics/DSCF4046-Enhanced-NR.jpg',
    '/pics/DSCF4056.jpg',
    '/pics/band_low.jpg'
];

export function initGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    // 1. Pick 8 random images
    const selected = [...ALL_IMAGES]
        .sort(() => 0.5 - Math.random())
        .slice(0, 8);

    // 2. Clear and Fill Grid
    grid.innerHTML = '';

    selected.forEach((src, i) => {
        const item = document.createElement('div');
        item.className = `gallery-item item-${i + 1}`;

        // Asymmetric sizing classes
        const sizeClass = i % 3 === 0 ? 'large' : (i % 2 === 0 ? 'medium' : 'small');
        item.classList.add(`gallery-item--${sizeClass}`);

        item.innerHTML = `
            <div class="gallery-item-inner">
                <img src="${src}" alt="Krypto Kosmetik Impression ${i + 1}" loading="lazy">
                <div class="gallery-item-overlay"></div>
            </div>
        `;
        grid.appendChild(item);

        // 3. Parallax Effect per Item
        gsap.fromTo(item.querySelector('img'), {
            y: -30
        }, {
            y: 30,
            ease: "none",
            scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });

        // Entrance animation
        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 90%",
                toggleActions: "play none none none"
            },
            opacity: 0,
            y: 50,
            scale: 0.9,
            duration: 1,
            ease: "back.out(1.7)"
        });
    });
}
