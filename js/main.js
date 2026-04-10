/**
 * DWP Static Site - Main Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Reveal animation for release items on the index/releases page
    const revealItems = document.querySelectorAll('.release-item, .release-detail');
    revealItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('visible');
        }, index * 100);
    });

    // Audio Playback Logic
    const audioItems = document.querySelectorAll('.track-item');
    let currentAudio = null;

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
