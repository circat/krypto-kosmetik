/**
 * AUDIO PLAYER – Retro Ghetto Blaster Logic
 * Bernd (The Forge) – Robust audio management
 * Optimized for "Chrome Beast" visual style and analog pitch effects
 */

const TRACKS = [
    { file: 'music/FINAL_DISCOMOPED.mp3', title: 'Discomoped', meta: 'Krypto Kosmetik' },
    { file: 'music/FINAL_HERZAUFRISS.mp3', title: 'Herzaufriss', meta: 'Krypto Kosmetik' },
    { file: 'music/FINAL_JUNAMELINA.mp3', title: 'Juna Melina', meta: 'Krypto Kosmetik' },
    { file: 'music/FINAL_LUFT.mp3', title: 'Luft', meta: 'Krypto Kosmetik' },
    { file: 'music/FINAL_NIEWIEDER.mp3', title: 'Nie Wieder', meta: 'Krypto Kosmetik' },
];

export function initAudioPlayer() {
    const audio = new Audio();
    audio.id = 'kk-audio-element';
    audio.preload = 'metadata';
    audio.style.display = 'none';
    audio.preservesPitch = false;
    audio.mozPreservesPitch = false;
    document.body.appendChild(audio);

    let currentTrack = 0;
    let isPlaying = false;
    let audioContext, analyzer, source, dataArray;
    let bassFilter, trebleFilter;
    let pitchInterval;

    const elTrackName = document.getElementById('track-name');
    const elTrackMeta = document.getElementById('track-meta');
    const elBtnPlay = document.getElementById('btn-play');
    const elIconPlay = document.getElementById('icon-play');
    const elIconPause = document.getElementById('icon-pause');
    const elProgressFill = document.getElementById('progress-fill');
    const elProgressThumb = document.getElementById('progress-thumb');
    const elProgress = document.getElementById('player-progress');
    const elTimeCur = document.getElementById('time-cur');
    const elTimeTotal = document.getElementById('time-total');
    const elPlaylist = document.getElementById('mini-playlist');
    const reelL = document.getElementById('reel-left');
    const reelR = document.getElementById('reel-right');
    const needleL = document.querySelector('#vu-left .vu-needle');
    const shatteredBg = document.getElementById('shattered-bg');

    const elBass = document.getElementById('bass-knob');
    const elTreble = document.getElementById('treble-knob');
    const dialBass = document.getElementById('bass-dial');
    const dialTreble = document.getElementById('treble-dial');

    if (!elBtnPlay) return;

    // ---- SETUP PLAYLIST ----
    TRACKS.forEach((track, idx) => {
        if (!elPlaylist) return;
        const item = document.createElement('div');
        item.className = 'mini-playlist-item' + (idx === 0 ? ' active' : '');
        item.setAttribute('role', 'listitem');
        item.tabIndex = 0;
        item.innerHTML = `
            <span class="playlist-num">${(idx + 1).toString().padStart(2, '0')}.</span>
            <span>${track.title.toUpperCase()}</span>
        `;
        item.addEventListener('click', () => loadTrack(idx, true));
        elPlaylist.appendChild(item);
    });

    function loadTrack(idx, autoPlay = false) {
        currentTrack = idx;
        const track = TRACKS[currentTrack];
        audio.src = track.file;
        if (elTrackName) elTrackName.textContent = track.title.toUpperCase();
        if (elTrackMeta) elTrackMeta.textContent = track.meta;

        document.querySelectorAll('.mini-playlist-item').forEach((el, i) => {
            el.classList.toggle('active', i === idx);
            if (i === idx) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });

        if (autoPlay) {
            startPlayback();
        } else {
            isPlaying = false;
            updatePlayState();
        }
    }

    function updateReelSpeed() {
        if (!reelL || !reelR) return;
        const rate = audio.playbackRate;
        const duration = rate > 0 ? (2 / rate) : 0;
        reelL.style.animationDuration = `${duration}s`;
        reelR.style.animationDuration = `${duration}s`;
    }

    function updatePlayState(reelsActive = null) {
        const showPlaying = reelsActive !== null ? reelsActive : isPlaying;
        if (elIconPlay) elIconPlay.style.display = isPlaying ? 'none' : 'block';
        if (elIconPause) elIconPause.style.display = isPlaying ? 'block' : 'none';
        if (elBtnPlay) elBtnPlay.setAttribute('aria-label', isPlaying ? 'Pause' : 'Wiedergabe starten');

        if (reelL && reelR) {
            reelL.classList.toggle('playing', showPlaying);
            reelR.classList.toggle('playing', showPlaying);
            updateReelSpeed();
        }
    }

    function rampPlaybackRate(target, duration, onComplete) {
        clearInterval(pitchInterval);
        const start = audio.playbackRate;
        const steps = 60;
        const interval = duration / steps;
        const delta = (target - start) / steps;
        let currentStep = 0;

        pitchInterval = setInterval(() => {
            currentStep++;
            audio.playbackRate = start + (delta * currentStep);
            updateReelSpeed();
            if (currentStep >= steps) {
                clearInterval(pitchInterval);
                audio.playbackRate = target;
                updateReelSpeed();
                if (onComplete) onComplete();
            }
        }, interval);
    }

    function updateKnobRotation(input, dial) {
        if (!input || !dial) return;
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const val = parseFloat(input.value);
        const pct = (val - min) / (max - min);
        // Rotate from -135deg to 135deg
        const rot = pct * 270 - 135;
        dial.style.transform = `rotate(${rot}deg)`;
    }

    function startPlayback() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyzer = audioContext.createAnalyser();
            analyzer.fftSize = 256;
            source = audioContext.createMediaElementSource(audio);

            // BASS FILTER
            bassFilter = audioContext.createBiquadFilter();
            bassFilter.type = 'lowshelf';
            bassFilter.frequency.value = 250;
            bassFilter.gain.value = elBass ? parseFloat(elBass.value) : 0;

            // TREBLE FILTER
            trebleFilter = audioContext.createBiquadFilter();
            trebleFilter.type = 'highshelf';
            trebleFilter.frequency.value = 3000;
            trebleFilter.gain.value = elTreble ? parseFloat(elTreble.value) : 0;

            // CONNECT NODES: source -> bass -> treble -> analyzer -> destination
            source.connect(bassFilter);
            bassFilter.connect(trebleFilter);
            trebleFilter.connect(analyzer);
            analyzer.connect(audioContext.destination);

            dataArray = new Uint8Array(analyzer.frequencyBinCount);

            // Setup real-time updates for knobs
            elBass?.addEventListener('input', (e) => {
                if (bassFilter) bassFilter.gain.value = parseFloat(e.target.value);
                updateKnobRotation(elBass, dialBass);
            });
            elTreble?.addEventListener('input', (e) => {
                if (trebleFilter) trebleFilter.gain.value = parseFloat(e.target.value);
                updateKnobRotation(elTreble, dialTreble);
            });

            // Initial rotation
            updateKnobRotation(elBass, dialBass);
            updateKnobRotation(elTreble, dialTreble);

            startVisualizer();
        }
        if (audioContext.state === 'suspended') audioContext.resume();

        audio.playbackRate = 0.75;
        audio.play().then(() => {
            isPlaying = true;
            updatePlayState();
            rampPlaybackRate(1.0, 1000);
        }).catch(() => { });
    }

    function togglePlay() {
        if (audio.src === '') loadTrack(0);
        if (isPlaying) {
            isPlaying = false;
            updatePlayState(true);
            rampPlaybackRate(0.5, 1000, () => {
                audio.pause();
                audio.playbackRate = 1.0;
                updatePlayState(false);
            });
        } else {
            startPlayback();
        }
    }

    function startVisualizer() {
        function draw() {
            requestAnimationFrame(draw);
            if (isPlaying && analyzer) {
                analyzer.getByteFrequencyData(dataArray);
            } else if (dataArray) {
                for (let i = 0; i < dataArray.length; i++) dataArray[i] *= 0.9;
            }

            if (dataArray) {
                let sum = 0;
                for (let i = 0; i < 20; i++) sum += dataArray[i];
                const avg = sum / 20;
                const rot = (avg / 255) * 90 - 45;
                if (needleL) needleL.style.transform = `translateX(-50%) rotate(${rot}deg)`;

                if (shatteredBg) {
                    const intensity = avg / 255;
                    if (intensity > 0.45) {
                        const shakeX = (Math.random() - 0.5) * 15 * intensity;
                        const shakeY = (Math.random() - 0.5) * 15 * intensity;
                        shatteredBg.style.transform = `translate(${shakeX}px, ${shakeY}px) scale(${1 + intensity * 0.05})`;
                        shatteredBg.classList.add('glitch-active');
                    } else {
                        shatteredBg.style.transform = '';
                        shatteredBg.classList.remove('glitch-active');
                    }
                }
            }
        }
        draw();
    }

    function fmt(sec) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    audio.addEventListener('timeupdate', () => {
        if (!isFinite(audio.duration)) return;
        const pct = (audio.currentTime / audio.duration) * 100;
        if (elProgressFill) elProgressFill.style.width = pct + '%';
        if (elProgressThumb) elProgressThumb.style.left = pct + '%';
        if (elTimeCur) elTimeCur.textContent = fmt(audio.currentTime);
        if (elProgress) elProgress.setAttribute('aria-valuenow', Math.round(pct));
    });

    audio.addEventListener('loadedmetadata', () => {
        if (elTimeTotal) elTimeTotal.textContent = fmt(audio.duration);
    });

    audio.addEventListener('ended', () => {
        loadTrack((currentTrack + 1) % TRACKS.length, true);
    });

    document.getElementById('btn-prev')?.addEventListener('click', () => {
        loadTrack((currentTrack - 1 + TRACKS.length) % TRACKS.length, true);
    });
    document.getElementById('btn-next')?.addEventListener('click', () => {
        loadTrack((currentTrack + 1) % TRACKS.length, true);
    });
    elBtnPlay.addEventListener('click', togglePlay);

    loadTrack(0);
}

