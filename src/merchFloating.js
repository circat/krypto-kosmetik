/**
 * MERCH FLOATING OBJECT – Krypto Kosmetik
 * Betty (The Architect) – 3D Parallax & Mouse Tracking
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initMerchFloating() {
    const section = document.querySelector('.section-merch');
    const parallaxWrap = document.querySelector('.merch-parallax-wrap');
    const artifact = document.querySelector('.merch-artifact');
    const marquee = document.querySelector('.merch-marquee-inner');

    if (!section || !artifact || !parallaxWrap) return;

    // 1. VERTICAL PARALLAX (Scroll-based)
    gsap.to(parallaxWrap, {
        scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        },
        y: -100,
        ease: "none"
    });

    // 2. MARQUEE ANIMATION
    gsap.to(marquee, {
        xPercent: -50,
        repeat: -1,
        duration: 25,
        ease: "none"
    });

    // 3. MOUSE TRACKING (Organic Movement)
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('mousemove', (e) => {
        // Values between -1 and 1
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    gsap.ticker.add(() => {
        targetX += (mouseX - targetX) * 0.1;
        targetY += (mouseY - targetY) * 0.1;

        gsap.set(artifact, {
            x: targetX * 30,
            y: targetY * 30,
            rotationY: targetX * 10,
            rotationX: -targetY * 10,
            rotationZ: targetX * 2,
            overwrite: 'auto'
        });
    });

    // 4. BUTTON REVEAL
    const merchBtn = section.querySelector('.merch-btn');
    if (merchBtn) {
        gsap.to(merchBtn, {
            scrollTrigger: {
                trigger: section,
                start: "top 60%",
                toggleActions: "play none none none"
            },
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            startAt: { y: 30, opacity: 0 }
        });
    }
}
