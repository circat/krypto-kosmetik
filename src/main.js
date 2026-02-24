/**
 * KRYPTO KOSMETIK – Main Entry Point
 * Bernd (The Forge) – Orchestrates all modules
 * Betty (The Architect) – 3D scenes
 * Simone (The Visionary) – Design system applied
 */

import './style.css';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initDiscoBall } from './discoBall.js';
import { initAudioPlayer } from './audioPlayer.js';
import { initGlitchQuotes } from './glitchQuotes.js';
import { initGallery } from './gallery.js';
import { initMerchFloating } from './merchFloating.js';

gsap.registerPlugin(ScrollTrigger);

// ---- LENIS SMOOTH SCROLL ----
const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.5
});

function rafLenis(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(rafLenis);
}
requestAnimationFrame(rafLenis);

// Prevent lenis on player scroll area
document.getElementById('playlist')?.setAttribute('data-lenis-prevent', 'true');

// ---- NAV SCROLL STATE ----
const nav = document.getElementById('main-nav');
lenis.on('scroll', ({ scroll }) => {
    nav?.classList.toggle('scrolled', scroll > 60);
});

// ---- HERO ENTRANCE ANIMATIONS ----
const ctx = gsap.context(() => {
    const tl = gsap.timeline({ delay: 0.2 });

    tl.to('.hero-tag', {
        opacity: 1,
        duration: 1,
        ease: 'power3.out'
    })
        .to('#hl1', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.4')
        .to('#hl2', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out'
        }, '-=0.7')
        .to('.hero-sub', {
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.5')
        .to('#hero-cta', {
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.4');

    // Section titles reveal on scroll
    gsap.utils.toArray('.section-title').forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 1,
            ease: 'power3.out'
        });
    });

    // Section labels
    gsap.utils.toArray('.section-label').forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            x: -20,
            duration: 0.7,
            ease: 'power2.out'
        });
    });

    // Contact links stagger
    gsap.from('.contact-link', {
        scrollTrigger: {
            trigger: '.contact-links',
            start: 'top 80%',
            toggleActions: 'play none none none'
        },
        opacity: 0,
        y: 20,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out'
    });

    // Contact slogan
    gsap.from('.contact-slogan', {
        scrollTrigger: {
            trigger: '.contact-slogan',
            start: 'top 85%',
            toggleActions: 'play none none none'
        },
        opacity: 0,
        scale: 0.9,
        duration: 1.2,
        ease: 'power3.out'
    });
});

// ---- 3D SCENES ----
const discoCanvas = document.getElementById('disco-canvas');
if (discoCanvas) {
    initDiscoBall(discoCanvas);
}


// ---- AUDIO PLAYER ----
initAudioPlayer();

// ---- GLITCH QUOTES ----
initGlitchQuotes();

// ---- GALLERY ----
initGallery();

// ---- MERCH FLOATING ----
initMerchFloating();

// ---- VIBE SHIFT (Theme Switcher) ----
const themes = ['', 'theme-acid', 'theme-chrome', 'theme-red'];
let currentThemeIdx = 0;
const navLogo = document.querySelector('.nav-logo');

navLogo?.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.classList.remove(...themes.filter(t => t !== ''));
    currentThemeIdx = (currentThemeIdx + 1) % themes.length;
    const nextTheme = themes[currentThemeIdx];
    if (nextTheme) document.body.classList.add(nextTheme);

    // Dynamic feedback
    gsap.fromTo(navLogo, { scale: 0.8, rotate: -15 }, { scale: 1, rotate: 0, duration: 0.4, ease: 'back.out(2)' });

    // Update 3D colors if applicable
    window.dispatchEvent(new CustomEvent('vibe-shift', { detail: { theme: nextTheme } }));
});

// ---- MAGNETIC BUTTONS ----
document.querySelectorAll('.btn-primary, .gallery-btn, .ctrl-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
        btn.style.transform = `translate(${x}px, ${y}px) scale(1.03)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
    });
});

// ---- SMOOTH ANCHOR LINKS (for nav) ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -80, duration: 1.4 });
        }
    });
});
// ---- BAND REFERENCES ACCORDION ----
const refToggle = document.getElementById('ref-toggle');
const refContainer = refToggle?.closest('.band-references');

refToggle?.addEventListener('click', () => {
    refContainer.classList.toggle('active');
    // Force Lenis to recalculate height after expansion
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 500);
});
