import { inspectMediaElementEvents } from '/utils.js';

const echo = document.querySelector('video.echo');
const cast = document.querySelector('video.cast');

inspectMediaElementEvents(echo);

(async () => {
    const localTracks = {
        videoTrack: await navigator.mediaDevices.getUserMedia({ audio: false, video: true }),
    };
    
    echo.srcObject = localTracks.videoTrack;

    echo.addEventListener('loadeddata', () => {
        echo.play();
    });

    window.echo = echo;
})();

// const peerConnection = new 
