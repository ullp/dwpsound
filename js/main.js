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

    // Reveal animation for release items on the index/releases page
    const revealItems = document.querySelectorAll('.release-item, .release-detail');
    revealItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 100);
    });

    // reveal animation logic is above this...
    
    // Audio Playback State
    let currentAudio = null;

    // Featured Album Playback (Hero)
    const featuredAlbum = document.getElementById('featured-album');
    if (featuredAlbum) {
        featuredAlbum.addEventListener('click', () => {
            const audioSrc = featuredAlbum.getAttribute('data-audio');
            const playIcon = featuredAlbum.querySelector('i');
            
            if (currentAudio && currentAudio.src.includes(audioSrc)) {
                if (currentAudio.paused) {
                    currentAudio.play();
                    playIcon.classList.replace('fa-play', 'fa-pause');
                } else {
                    currentAudio.pause();
                    playIcon.classList.replace('fa-pause', 'fa-play');
                }
                return;
            }

            if (currentAudio) {
                currentAudio.pause();
                document.querySelectorAll('.playing-track').forEach(el => el.classList.remove('playing-track'));
                document.querySelectorAll('.play-overlay i').forEach(i => i.classList.replace('fa-pause', 'fa-play'));
            }

            currentAudio = new Audio(audioSrc);
            currentAudio.play();
            playIcon.classList.replace('fa-play', 'fa-pause');

            currentAudio.addEventListener('ended', () => {
                playIcon.classList.replace('fa-pause', 'fa-play');
            });
        });
    }

    // Audio Playback Logic for lists
    const audioItems = document.querySelectorAll('.track-item');
    audioItems.forEach(item => {
        item.addEventListener('click', () => {
            const trackName = item.querySelector('span').innerText.trim();
            const audioSrc = item.getAttribute('data-audio');

            if (!audioSrc) {
                console.warn(`No audio source defined for: ${trackName}`);
                return;
            }

            // If clicking the same track that is currently playing - toggle play/pause
            if (currentAudio && currentAudio.src.includes(audioSrc)) {
                if (currentAudio.paused) {
                    currentAudio.play();
                    item.classList.add('playing-track');
                } else {
                    currentAudio.pause();
                    item.classList.remove('playing-track');
                }
                return;
            }

            // Stop previous audio
            if (currentAudio) {
                currentAudio.pause();
                document.querySelectorAll('.playing-track').forEach(el => el.classList.remove('playing-track'));
            }

            // Initialize new audio
            currentAudio = new Audio(audioSrc);
            currentAudio.play();
            item.classList.add('playing-track');

            currentAudio.addEventListener('ended', () => {
                item.classList.remove('playing-track');
            });
        });
    });
});
