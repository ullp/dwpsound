/**
 * DWP Sound Universe — Modern Dark Music Theme
 * Angio-inspired interactive physics, liquid wave & audio engine
 */

document.addEventListener('DOMContentLoaded', () => {
    /* ── Home intro loader, like music-theme preloader transitions ── */
    const loaderBody = document.body;
    if (loaderBody.classList.contains('home-page')) {
        window.setTimeout(() => {
            loaderBody.classList.remove('is-loading');
            loaderBody.classList.add('loaded');
        }, 850);
    }

    /* ── Header / Footer scroll detection ── */
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    const toggleScrolled = () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
            if (footer) footer.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            if (footer) footer.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', toggleScrolled, { passive: true });
    toggleScrolled();

    /* ── Mobile Menu Toggle ── */
    const menuToggle = document.querySelector('.menu-toggle');
    const body = document.body;

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            body.classList.toggle('menu-active');
        });
    }

    /* ── Close menu when a link is clicked ── */
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            body.classList.remove('menu-active');
        });
    });

    /* ── Reveal animation (Staggered) ── */
    const revealItems = document.querySelectorAll('.release-item, .release-detail');
    revealItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 100);
    });

    /* ── Sessions page reveal ── */
    const sessionRevealItems = document.querySelectorAll('.collab-banner, .upcoming-card, .venue-row');
    sessionRevealItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 150);
    });

    /* ═══════════════════════════════════════════
       ANGIO MAGIC WAVE (Interactive Liquid Canvas)
       ═══════════════════════════════════════════ */
    const magicWave = {
        canvasDom: null,
        ctx: null,
        amount: 14,
        spring: -3.5,
        damping: -0.09,
        baseYvalue: 0.54,
        limit: 1.15,
        waveCount: 3,
        mass: 0.1,
        wavePointsSet: [],
        waveColors: ['rgba(0, 243, 255, 0.2)', 'rgba(19, 119, 106, 0.42)', 'rgba(5, 5, 10, 0.88)'],
        animFrame: null,
        autoPointInterval: null,
        baseY: 0,
        segWidth: 0,
        xNum: 0,

        init() {
            this.canvasDom = document.getElementById('magic-wave');
            if (!this.canvasDom) return;

            if (this.animFrame) cancelAnimationFrame(this.animFrame);
            if (this.autoPointInterval) clearInterval(this.autoPointInterval);

            const col1 = this.canvasDom.getAttribute('data-col1') || 'rgba(0, 243, 255, 0.2)';
            const col2 = this.canvasDom.getAttribute('data-col2') || 'rgba(19, 119, 106, 0.42)';
            const col3 = this.canvasDom.getAttribute('data-col3') || 'rgba(5, 5, 10, 0.88)';
            this.waveColors = [col1, col2, col3];

            this.reSize = this.reSize.bind(this);
            this.reSize();
            window.addEventListener('resize', this.reSize, false);

            // Interactive mouse disturbance across the window
            window.addEventListener('mousemove', (e) => {
                this.setXnum(e.clientX);
                this.triggerPoint({
                    x: e.clientX,
                    y: (e.clientY - this.baseY) * 0.4
                });
            }, { passive: true });

            // Interactive touch disturbance
            window.addEventListener('touchmove', (e) => {
                if (e.touches && e.touches.length > 0) {
                    const touch = e.touches[0];
                    this.setXnum(touch.clientX);
                    this.triggerPoint({
                        x: touch.clientX,
                        y: (touch.clientY - this.baseY) * 0.4
                    });
                }
            }, { passive: true });

            // Click ripple
            window.addEventListener('click', (e) => {
                this.setXnum(e.clientX);
                this.triggerPoint({
                    x: e.clientX,
                    y: -120
                });
            });

            // Gentle continuous ambient ripples
            this.multiPoints(180);

            // Start 60fps loop
            this.doWaveLoop();
        },

        reSize() {
            if (!this.canvasDom) return;
            this.canvasDom.width = window.innerWidth;
            this.canvasDom.height = window.innerHeight;
            this.ctx = this.canvasDom.getContext('2d');
            this.segWidth = window.innerWidth / this.amount;
            this.baseY = this.canvasDom.height * this.baseYvalue;
            this.setPoints();
        },

        setPoints() {
            this.wavePointsSet = [];
            for (let i = 0; i < this.waveCount; i++) {
                this.wavePointsSet[i] = [];
                for (let j = 0; j <= this.amount + 1; j++) {
                    this.wavePointsSet[i].push({
                        x: this.segWidth * j,
                        y: this.baseY,
                        vx: 0,
                        vy: 0,
                        ty: 0
                    });
                }
            }
        },

        updatePoints(wavePoints, spring, damping, time) {
            for (let i = 0; i < wavePoints.length; i++) {
                const point = wavePoints[i];
                const springY = spring * (point.y - this.baseY);
                const dampingY = damping * point.vy;
                point.vy += (springY + dampingY) / this.mass * time;
                point.y += point.vy * time;
            }
        },

        doWave(wavePoints, color) {
            if (!this.ctx || !wavePoints || wavePoints.length < 2) return;
            this.ctx.beginPath();
            this.ctx.lineTo(0, 0);
            this.ctx.quadraticCurveTo(-100, this.baseY, -150, this.baseY);
            for (let i = 0; i < wavePoints.length - 1; i++) {
                const xc = (wavePoints[i].x + wavePoints[i + 1].x) / 2;
                const yc = (wavePoints[i].y + wavePoints[i + 1].y) / 2;
                this.ctx.quadraticCurveTo(wavePoints[i].x, wavePoints[i].y, xc, yc);
            }
            const last = wavePoints.length - 1;
            this.ctx.quadraticCurveTo(
                wavePoints[last - 1].x,
                wavePoints[last - 1].y,
                wavePoints[last].x,
                wavePoints[last].y
            );
            this.ctx.lineTo(window.innerWidth, 0);
            this.ctx.closePath();
            this.ctx.fillStyle = color;
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.fill();
        },

        multiPoints(interval) {
            if (this.autoPointInterval) clearInterval(this.autoPointInterval);
            this.autoPointInterval = setInterval(() => {
                const randomPoint = {
                    x: Math.floor(Math.random() * window.innerWidth),
                    y: Math.floor(Math.random() * (this.baseY * 0.35))
                };
                this.setXnum(randomPoint.x);
                this.triggerPoint(randomPoint);
            }, interval);
        },

        setXnum(pointX) {
            this.xNum = Math.min(this.amount, Math.max(0, Math.round((pointX / window.innerWidth) * this.amount)));
        },

        triggerPoint(point) {
            let velocity = point.y;
            if (velocity > 0) velocity *= -1;
            const limit = (window.innerHeight * this.limit) / 100;
            velocity = Math.min(Math.max(velocity, -limit), limit) * 8;

            for (let i = 0; i < this.wavePointsSet.length; i++) {
                const points = this.wavePointsSet[i];
                if (points && points[this.xNum]) {
                    if (points[this.xNum].vy < 0) {
                        points[this.xNum].vy += velocity;
                    } else {
                        points[this.xNum].vy -= velocity;
                    }
                }
            }
        },

        doWaveLoop() {
            if (!this.ctx) return;
            this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            this.updatePoints(this.wavePointsSet[0], this.spring, this.damping, 0.0161);
            this.updatePoints(this.wavePointsSet[1], this.spring - 0.5, this.damping + 0.01, 0.0162);
            this.updatePoints(this.wavePointsSet[2], this.spring - 1.0, this.damping + 0.02, 0.0163);

            for (let i = 0; i < this.waveCount; i++) {
                this.doWave(this.wavePointsSet[i], this.waveColors[i]);
            }

            this.animFrame = requestAnimationFrame(this.doWaveLoop.bind(this));
        },

        moveThis() {
            const moveEl = document.querySelector('.wave-move-this');
            if (!moveEl || !this.wavePointsSet[0]) return;

            const points = this.wavePointsSet[0];
            const centerIdx = Math.floor(this.amount / 2);
            const point = points[centerIdx];
            if (point) {
                if (!point.ty) point.ty = 0;
                point.ty += (point.vy * 0.018) / 2.3;
                // Bobbing vertical offset
                const clamped = Math.max(-28, Math.min(28, point.ty));
                moveEl.style.transform = `translate3d(0, ${clamped.toFixed(2)}px, 0)`;
            }
        }
    };

    // Initialize fluid wave
    magicWave.init();

    /* ═══════════════════════════════════════════
       POINTER-REACTIVE HOME PARALLAX
       ═══════════════════════════════════════════ */
    const homeHero = document.querySelector('.home-page .hero');
    const animateHomeAlbum = false;
    if (animateHomeAlbum && homeHero && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const orbCyan = homeHero.querySelector('.hero-orb--cyan');
        const orbViolet = homeHero.querySelector('.hero-orb--violet');
        const albumWrap = homeHero.querySelector('.wave-album');
        const title = homeHero.querySelector('.featured-title');

        let targetX = 0;
        let targetY = 0;
        let currentX = 0;
        let currentY = 0;

        window.addEventListener('mousemove', (event) => {
            targetX = (event.clientX / window.innerWidth - 0.5) * 2;
            targetY = (event.clientY / window.innerHeight - 0.5) * 2;
        }, { passive: true });

        const parallaxLoop = () => {
            currentX += (targetX - currentX) * 0.055;
            currentY += (targetY - currentY) * 0.055;

            if (orbCyan) orbCyan.style.transform = `translate3d(${currentX * 38}px, ${currentY * 26}px, 0)`;
            if (orbViolet) orbViolet.style.transform = `translate3d(${currentX * -34}px, ${currentY * -28}px, 0)`;
            if (albumWrap) albumWrap.style.transform = `translate3d(${currentX * -10}px, ${currentY * -8}px, 0)`;
            if (title) title.style.textShadow = `${currentX * -10}px ${currentY * -8}px 28px rgba(0, 243, 255, 0.24), 0 10px 30px rgba(0, 0, 0, 0.8)`;

            requestAnimationFrame(parallaxLoop);
        };

        parallaxLoop();
    }

    /* ═══════════════════════════════════════════
       3D PERSPECTIVE TILT ON ARTWORK
       ═══════════════════════════════════════════ */
    const card = document.querySelector('.gthumb');
    if (card && !document.body.classList.contains('home-page')) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const rotateX = -(y / (rect.height / 2)) * 10;
            const rotateY = (x / (rect.width / 2)) * 10;
            card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    }

    /* ═══════════════════════════════════════════
       ANGIO CONSOLE TYPER (AutoType Subtitle)
       ═══════════════════════════════════════════ */
    const autoTypeEl = document.querySelector('.autotype');
    if (autoTypeEl && document.body.classList.contains('home-page')) {
        autoTypeEl.textContent = autoTypeEl.getAttribute('data-text') || autoTypeEl.textContent.trim();
    } else if (autoTypeEl && !autoTypeEl.classList.contains('autotype-started')) {
        const fullText = autoTypeEl.getAttribute('data-text') || autoTypeEl.textContent.trim();
        autoTypeEl.textContent = '';
        autoTypeEl.classList.add('autotype-started');

        let i = 0;
        setTimeout(() => {
            const typer = setInterval(() => {
                if (i < fullText.length) {
                    i++;
                    autoTypeEl.textContent = fullText.substring(0, i);
                } else {
                    autoTypeEl.classList.add('done');
                    clearInterval(typer);
                }
            }, 65);
        }, 500);
    }

    /* ═══════════════════════════════════════════
       AUDIO PLAYBACK & EQUALIZER ENGINE
       ═══════════════════════════════════════════ */
    let currentAudio = null;
    let activeTrackItem = null;

    function createPlayerTemplate() {
        const div = document.createElement('div');
        div.className = 'inline-player';
        div.innerHTML = `
            <div class="player-content">
                <span id="track-title" class="track-title-el"></span>
                <input type="range" id="seek-bar" value="0" step="0.1" style="width: 100%;">
                <button id="play-pause-btn" class="play-pause-btn-modern" aria-label="Play/Pause">
                    <i class="fas fa-pause"></i>
                </button>
            </div>
        `;
        return div;
    }

    function setPlayOverlayIcon(element, playing) {
        if (!element) return;
        const overlayIcon = element.querySelector('.play-overlay i');
        if (overlayIcon) {
            overlayIcon.classList.toggle('fa-play', !playing);
            overlayIcon.classList.toggle('fa-pause', playing);
        }
        element.classList.toggle('playing', playing);
    }

    function setHeaderPlayerState(playing) {
        const headerBtn = document.getElementById('header-bg-player');
        if (headerBtn) {
            headerBtn.classList.toggle('playing', playing);
        }
        const featured = document.getElementById('featured-album');
        if (featured) {
            setPlayOverlayIcon(featured, playing);
        }
    }

    function setPlayBtnIcon(playing) {
        const btn = document.getElementById('play-pause-btn');
        if (btn) {
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-play', !playing);
                icon.classList.toggle('fa-pause', playing);
            }
        }
    }

    function updateTrackTitle(text, isActive) {
        const trackTitleDisplay = document.getElementById('track-title');
        if (trackTitleDisplay) {
            trackTitleDisplay.innerText = text;
            trackTitleDisplay.classList.toggle('playing', isActive);
        }
    }

    function playTrack(src, title, element) {
        if (currentAudio && currentAudio.src.includes(src)) {
            if (currentAudio.paused) {
                currentAudio.play();
                setPlayBtnIcon(true);
                if (element) {
                    element.classList.add('playing-track');
                    setPlayOverlayIcon(element, true);
                }
                setHeaderPlayerState(true);
            } else {
                currentAudio.pause();
                setPlayBtnIcon(false);
                if (element) {
                    element.classList.remove('playing-track');
                    setPlayOverlayIcon(element, false);
                }
                setHeaderPlayerState(false);
            }
            return;
        }

        if (currentAudio) {
            currentAudio.pause();
            document.querySelectorAll('.playing-track, .playing').forEach(el => {
                el.classList.remove('playing-track', 'playing');
                setPlayOverlayIcon(el, false);
            });
            const oldPlayer = document.querySelector('.inline-player');
            if (oldPlayer) oldPlayer.remove();
        }

        activeTrackItem = element;

        // Insert inline player if clicked from tracklist
        if (element && element.classList.contains('track-item')) {
            const player = createPlayerTemplate();
            element.parentNode.insertBefore(player, element.nextSibling);

            const seekBar = player.querySelector('#seek-bar');
            const playPauseBtn = player.querySelector('#play-pause-btn');

            updateTrackTitle(title, true);

            currentAudio = new Audio(src);
            currentAudio.play();
            setPlayBtnIcon(true);
            element.classList.add('playing-track');
            setHeaderPlayerState(true);

            currentAudio.addEventListener('loadedmetadata', () => {
                seekBar.max = currentAudio.duration;
            });

            currentAudio.addEventListener('timeupdate', () => {
                if (!seekBar.dragging) {
                    seekBar.value = currentAudio.currentTime;
                }
            });

            seekBar.addEventListener('input', () => {
                currentAudio.currentTime = seekBar.value;
            });

            seekBar.addEventListener('change', () => {
                currentAudio.currentTime = seekBar.value;
            });

            seekBar.addEventListener('mousedown', () => { seekBar.dragging = true; });
            seekBar.addEventListener('mouseup', () => {
                seekBar.dragging = false;
                currentAudio.currentTime = seekBar.value;
            });
            seekBar.addEventListener('mouseleave', () => {
                seekBar.dragging = false;
            });

            currentAudio.addEventListener('ended', () => {
                element.classList.remove('playing-track');
                setPlayOverlayIcon(element, false);
                setPlayBtnIcon(false);
                setHeaderPlayerState(false);
                updateTrackTitle(title, false);
                seekBar.value = 0;
                player.remove();
            });

            playPauseBtn.addEventListener('click', () => {
                if (currentAudio.paused) {
                    currentAudio.play();
                    setPlayBtnIcon(true);
                    setPlayOverlayIcon(element, true);
                    setHeaderPlayerState(true);
                } else {
                    currentAudio.pause();
                    setPlayBtnIcon(false);
                    setPlayOverlayIcon(element, false);
                    setHeaderPlayerState(false);
                }
            });
        } else {
            // Played from header player or featured album
            currentAudio = new Audio(src);
            currentAudio.play();
            if (element) {
                element.classList.add('playing-track');
                setPlayOverlayIcon(element, true);
            }
            setHeaderPlayerState(true);

            currentAudio.addEventListener('ended', () => {
                if (element) {
                    element.classList.remove('playing-track');
                    setPlayOverlayIcon(element, false);
                }
                setHeaderPlayerState(false);
            });
        }
    }

    /* ── Track Items Click Handlers ── */
    const audioItems = document.querySelectorAll('.track-item');
    audioItems.forEach(item => {
        item.addEventListener('click', () => {
            const span = item.querySelector('span');
            const trackName = span ? span.innerText.trim() : 'Track';
            const audioSrc = item.getAttribute('data-audio');
            if (!audioSrc) return;
            playTrack(audioSrc, trackName, item);
        });
    });

    /* ── Featured Album Click Handler ── */
    const featuredAlbum = document.getElementById('featured-album');
    if (featuredAlbum) {
        const featuredAudioSrc = featuredAlbum.getAttribute('data-audio') || 'audio/crystal/01-CrystalBeats.mp3';
        const featuredTrackTitle = featuredAlbum.getAttribute('data-title') || 'Crystal Beats (Prelude)';

        featuredAlbum.addEventListener('click', () => {
            playTrack(featuredAudioSrc, featuredTrackTitle, featuredAlbum);
        });
    }

    /* ── Header Equalizer Button Click Handler ── */
    const headerBgPlayer = document.getElementById('header-bg-player');
    if (headerBgPlayer) {
        headerBgPlayer.addEventListener('click', () => {
            const featuredAudioSrc = (featuredAlbum && featuredAlbum.getAttribute('data-audio')) || 'audio/crystal/01-CrystalBeats.mp3';
            const featuredTrackTitle = (featuredAlbum && featuredAlbum.getAttribute('data-title')) || 'Crystal Beats (Prelude)';
            playTrack(featuredAudioSrc, featuredTrackTitle, featuredAlbum || headerBgPlayer);
        });
    }
});
