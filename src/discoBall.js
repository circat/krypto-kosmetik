/**
 * DISCO BALL – Three.js Scene
 * Betty (The Architect) – Performance-optimized
 * 60 FPS target: low-poly sphere, instanced mirror tiles, limited light count
 */

import * as THREE from 'three';
import { gsap } from 'gsap';

export function initDiscoBall(canvasEl) {
    if (!canvasEl) return;

    // ---- RENDERER ----
    const renderer = new THREE.WebGLRenderer({
        canvas: canvasEl,
        antialias: false,          // OFF for performance
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(canvasEl.offsetWidth, canvasEl.offsetHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // cap pixel ratio
    renderer.shadowMap.enabled = false;

    // ---- SCENE & CAMERA ----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, canvasEl.offsetWidth / canvasEl.offsetHeight, 0.1, 50);
    camera.position.set(0, 0.5, 5);

    // ---- BACKGROUND REMOVED TO SHOW VIDEO ----

    // ---- DISCO BALL (Instanced Tiles) ----
    const BALL_RADIUS = 1.2;
    const TILE_COUNT_U = 24;   // horizontal divisions
    const TILE_COUNT_V = 20;   // vertical divisions
    const TOTAL_TILES = TILE_COUNT_U * TILE_COUNT_V;

    const tileGeo = new THREE.PlaneGeometry(0.09, 0.09);
    const tileMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        specular: 0xffffff,
        shininess: 200,
        flatShading: true
    });

    const instancedMesh = new THREE.InstancedMesh(tileGeo, tileMat, TOTAL_TILES);
    instancedMesh.frustumCulled = false;

    const dummy = new THREE.Object3D();
    let idx = 0;
    for (let v = 0; v < TILE_COUNT_V; v++) {
        const phi = (Math.PI / TILE_COUNT_V) * (v + 0.5);
        for (let u = 0; u < TILE_COUNT_U; u++) {
            const theta = (2 * Math.PI / TILE_COUNT_U) * u;
            dummy.position.set(
                BALL_RADIUS * Math.sin(phi) * Math.cos(theta),
                BALL_RADIUS * Math.cos(phi),
                BALL_RADIUS * Math.sin(phi) * Math.sin(theta)
            );
            dummy.lookAt(0, 0, 0);
            dummy.rotateY(Math.PI);
            dummy.scale.setScalar(1 + Math.random() * 0.08);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(idx, dummy.matrix);

            // Slight color variation: mostly white/chrome, occasional pink/cyan tile
            const rand = Math.random();
            let col;
            if (rand > 0.96) col = new THREE.Color(0xff007f);
            else if (rand > 0.92) col = new THREE.Color(0x00e5ff);
            else col = new THREE.Color(0xd0d0d0);
            instancedMesh.setColorAt(idx, col);
            idx++;
        }
    }
    instancedMesh.instanceMatrix.needsUpdate = true;
    scene.add(instancedMesh);

    // ---- ROTATION GROUP ----
    const ballGroup = new THREE.Group();
    ballGroup.add(instancedMesh);
    ballGroup.position.set(0, 1.2, 0);
    scene.add(ballGroup);

    // Hanging wire
    const wireGeo = new THREE.CylinderGeometry(0.003, 0.003, 2.5, 4);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x555555 });
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.set(0, 3.7, 0);
    scene.add(wire);

    // ---- LIGHTS ----
    // Ambient – just enough to see the ball shape
    const ambient = new THREE.AmbientLight(0x111111, 1);
    scene.add(ambient);

    // Single spinning spot that creates the "disco reflections" feel
    const spotLight = new THREE.SpotLight(0xffffff, 80, 12, 0.3, 0.4);
    spotLight.position.set(0, 4, 3);
    scene.add(spotLight);

    // Pink accent from below
    const pinkLight = new THREE.PointLight(0xff007f, 20, 8);
    pinkLight.position.set(-2, -1, 2);
    scene.add(pinkLight);

    // Cyan accent
    const cyanLight = new THREE.PointLight(0x00e5ff, 15, 8);
    cyanLight.position.set(2, 0.5, -1);
    scene.add(cyanLight);

    // ---- VIBE SHIFT LISTENER ----
    window.addEventListener('vibe-shift', (e) => {
        const theme = e.detail.theme;
        let pCol, cCol;

        if (theme === 'theme-acid') {
            pCol = 0xbfff00; cCol = 0x80ff00;
        } else if (theme === 'theme-chrome') {
            pCol = 0xffffff; cCol = 0x888888;
        } else if (theme === 'theme-red') {
            pCol = 0xff0000; cCol = 0x330000;
        } else {
            pCol = 0xff007f; cCol = 0x00e5ff;
        }

        gsap.to(pinkLight.color, { r: ((pCol >> 16) & 255) / 255, g: ((pCol >> 8) & 255) / 255, b: (pCol & 255) / 255, duration: 1 });
        gsap.to(cyanLight.color, { r: ((cCol >> 16) & 255) / 255, g: ((cCol >> 8) & 255) / 255, b: (cCol & 255) / 255, duration: 1 });

        // Update tile colors
        for (let i = 0; i < TOTAL_TILES; i++) {
            const rand = Math.random();
            let col;
            if (rand > 0.95) col = new THREE.Color(pCol);
            else if (rand > 0.90) col = new THREE.Color(cCol);
            else col = new THREE.Color(0xd0d0d0);
            instancedMesh.setColorAt(i, col);
        }
        instancedMesh.instanceColor.needsUpdate = true;
    });

    // ---- MOUSE PARALLAX ----
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ---- GSAP ENTRANCE ----
    gsap.from(ballGroup.position, { y: 3, duration: 2.5, ease: 'elastic.out(1, 0.5)', delay: 0.3 });
    gsap.from(ballGroup.scale, { x: 0, y: 0, z: 0, duration: 1.5, ease: 'power3.out', delay: 0.3 });

    // ---- RENDER LOOP ----
    let rafId = null;
    const clock = new THREE.Clock();
    let prevTime = 0;
    // Throttle to 60 fps max
    const TARGET_FPS = 60;
    const FRAME_INTERVAL = 1 / TARGET_FPS;

    function animate() {
        rafId = requestAnimationFrame(animate);
        const now = clock.getElapsedTime();
        if (now - prevTime < FRAME_INTERVAL) return;
        prevTime = now;

        // Rotate ball
        ballGroup.rotation.y += 0.004;

        // Orbit spot light around ball
        spotLight.position.x = Math.sin(now * 0.5) * 3;
        spotLight.position.z = Math.cos(now * 0.5) * 3;

        // Pink/cyan lights oscillate for color sweep
        pinkLight.intensity = 15 + Math.sin(now * 1.2) * 8;
        cyanLight.intensity = 12 + Math.cos(now * 0.9) * 6;

        // Subtle camera sway following mouse (lerped)
        camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 0.3 + 0.5 - camera.position.y) * 0.04;
        camera.lookAt(0, 1.2, 0);

        renderer.render(scene, camera);
    }
    animate();

    // ---- RESIZE ----
    const onResize = () => {
        const w = canvasEl.offsetWidth;
        const h = canvasEl.offsetHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
    };
    window.addEventListener('resize', onResize, { passive: true });

    // ---- CLEANUP ----
    return () => {
        cancelAnimationFrame(rafId);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        tileGeo.dispose();
        tileMat.dispose();
    };
}
