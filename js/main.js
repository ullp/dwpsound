/**
 * DWP Static Site - Main Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const body = document.body;

    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            body.classList.toggle('menu-active');
        });
    }

    // Close menu when a link is clicked
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            body.classList.remove('menu-active');
        });
    });

    // Reveal animation
    const revealItems = document.querySelectorAll('.release-item, .release-detail');
    revealItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 100);
    });

    // Audio Playback State
    let currentAudio = null;
    let activeTrackItem = null;

    function createPlayerTemplate() {
        const div = document.createElement('div');
        div.className = 'inline-player';
        div.innerHTML = `
            <div class="player-content">
                <span id="track-title"></span>
                <input type="range" id="seek-bar" value="0" step="0.1" style="width: 100%;">
                <button id="play-pause-btn">Play</button>
            </div>
        `;
        return div;
    }

    function setPlayOverlayIcon(element, playing) {
        const overlayIcon = element.querySelector('.play-overlay i');
        if (overlayIcon) {
            overlayIcon.classList.toggle('fa-play', !playing);
            overlayIcon.classList.toggle('fa-pause', playing);
        }
    }

    function playTrack(src, title, element) {
        if (currentAudio && currentAudio.src.includes(src)) {
            if (currentAudio.paused) {
                currentAudio.play();
                document.getElementById('play-pause-btn').innerText = 'Pause';
                element.classList.add('playing-track');
                setPlayOverlayIcon(element, true);
            } else {
                currentAudio.pause();
                document.getElementById('play-pause-btn').innerText = 'Play';
                element.classList.remove('playing-track');
                setPlayOverlayIcon(element, false);
            }
            return;
        }

        if (currentAudio) {
            currentAudio.pause();
            document.querySelectorAll('.playing-track').forEach(el => {
                el.classList.remove('playing-track');
                setPlayOverlayIcon(el, false);
            });
            const oldPlayer = document.querySelector('.inline-player');
            if (oldPlayer) oldPlayer.remove();
        }

        activeTrackItem = element;
        const player = createPlayerTemplate();
        element.parentNode.insertBefore(player, element.nextSibling);

        const seekBar = player.querySelector('#seek-bar');
        const playPauseBtn = player.querySelector('#play-pause-btn');
        const trackTitleDisplay = player.querySelector('#track-title');

        trackTitleDisplay.innerText = title;
        currentAudio = new Audio(src);
        currentAudio.play();
        playPauseBtn.innerText = 'Pause';
        element.classList.add('playing-track');
        setPlayOverlayIcon(element, true);

        currentAudio.addEventListener('loadedmetadata', () => {
            seekBar.max = currentAudio.duration;
        });

        currentAudio.addEventListener('timeupdate', () => {
            seekBar.value = currentAudio.currentTime;
        });

        currentAudio.addEventListener('ended', () => {
            element.classList.remove('playing-track');
            setPlayOverlayIcon(element, false);
            playPauseBtn.innerText = 'Play';
            seekBar.value = 0;
            player.remove();
        });

        playPauseBtn.addEventListener('click', () => {
            if (currentAudio.paused) {
                currentAudio.play();
                playPauseBtn.innerText = 'Pause';
                setPlayOverlayIcon(element, true);
            } else {
                currentAudio.pause();
                playPauseBtn.innerText = 'Play';
                setPlayOverlayIcon(element, false);
            }
        });

        seekBar.addEventListener('input', () => {
            currentAudio.currentTime = seekBar.value;
        });
    }

    // Audio Playback Logic for lists
    const audioItems = document.querySelectorAll('.track-item');
    audioItems.forEach(item => {
        item.addEventListener('click', () => {
            const trackName = item.querySelector('span').innerText.trim();
            const audioSrc = item.getAttribute('data-audio');

            if (!audioSrc) return;

            playTrack(audioSrc, trackName, item);
        });
    });

    // Audio Playback Logic for the featured album on the home page (plays the 1st track)
    const featuredAlbum = document.getElementById('featured-album');
    if (featuredAlbum) {
        const featuredAudioSrc = featuredAlbum.getAttribute('data-audio');
        const featuredTrackTitle = featuredAlbum.getAttribute('data-title');

        if (featuredAudioSrc) {
            featuredAlbum.addEventListener('click', () => {
                playTrack(featuredAudioSrc, featuredTrackTitle || 'Crystal Beats (Prelude)', featuredAlbum);
            });
        }
    }
});
