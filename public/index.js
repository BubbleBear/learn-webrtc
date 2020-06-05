import { inspectMediaElementEvents } from '/utils.js';
import PersistentConnection from '/persistent-connection.js';

const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
];

const localVideo = document.querySelector('video.local');
const remoteVideo = document.querySelector('video.remote');

localVideo.addEventListener('loadeddata', () => {
    localVideo.play();
});

remoteVideo.addEventListener('loadeddata', () => {
    remoteVideo.play();
});

const connection = new PersistentConnection(`/api/v1/asdf${window.location.search}`, { minInterval: 5000 });

inspectMediaElementEvents(localVideo);

function createPeerConnection(tracks) {
    const peerConnection = new RTCPeerConnection({
        iceServers,
    });

    tracks.forEach((track) => {
        peerConnection.addTrack(track);
    });

    peerConnection.ontrack = (event) => {
        console.log(event);

        remoteVideo.srcObject = event.streams[0];
    };

    return peerConnection;
}

async function connect() {
    const localStreams = {
        videoStream: await navigator.mediaDevices.getUserMedia({ audio: false, video: true }),
    };

    const tracks = Array.from(Object.values(localStreams)).reduce((tracks, stream) => {
        return tracks.concat(stream.getTracks());
    }, []);

    let peerConnection = createPeerConnection(tracks);

    localVideo.srcObject = localStreams.videoStream;

    const offer = await peerConnection.createOffer();

    peerConnection.setLocalDescription(offer);

    connection.poll(async (message) => {
        const sdp = message.sdp;

        console.log(message);

        if (typeof sdp !== 'object') {
            return;
        }

        if (JSON.stringify(offer) === JSON.stringify(sdp.offer)) {
            if (sdp.answer) {
                const answer = new RTCSessionDescription(sdp.answer);
                console.log(answer);
                peerConnection.setRemoteDescription(answer);

                connection.close();
            }
        } else {
            if (sdp.offer && sdp.answer === undefined) {
                const offer = new RTCSessionDescription(sdp.offer);
                console.log(offer);
                peerConnection.setRemoteDescription(offer);

                const answer = await peerConnection.createAnswer();
                peerConnection.setLocalDescription(answer);

                fetch(`/api/v1/join?room=vatel`, {
                    method: 'post',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({answer}),
                });

                connection.close();
            }
        }
    }, {
        method: 'post'
    });

    peerConnection.onicecandidate = (event) => {
        event.candidate === null && fetch(`/api/v1/join?room=vatel`, {
            method: 'post',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({offer}),
        });
    };

    return peerConnection;
};

(async () => {
    window.peer = await connect();
})();
