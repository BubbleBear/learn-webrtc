import { inspectMediaElementEvents } from '/utils.js';
import PersistentConnection from '/persistent-connection.js';

const STATES = {
    new: 0,
    offered: 1,
    answered: 2,
    icing: 3,
    connected: 4,
};

const api = `/api/v1/webrtc`;

const iceServers = [
    {
        urls: [
            'stun:stun.l.google.com:19302',
            'stun:23.21.150.121',
        ]
    },
];

const localVideo = document.querySelector('video.local');
const remoteVideo = document.querySelector('video.remote');

localVideo.addEventListener('loadeddata', () => {
    localVideo.play();
});

remoteVideo.addEventListener('loadeddata', () => {
    remoteVideo.play();
});

const connection = new PersistentConnection(`${api}/polling${window.location.search}`, { minInterval: 5000 });

inspectMediaElementEvents(localVideo);

function createPeerConnection(tracks) {
    const peerConnection = new RTCPeerConnection({
        iceServers,
    });

    tracks.forEach((track) => {
        peerConnection.addTrack(track);
    });

    peerConnection.addEventListener('track', (event) => {
        console.log(event);

        remoteVideo.srcObject = new MediaStream();
        remoteVideo.srcObject.addTrack(event.track);
    });

    return peerConnection;
}

async function connect() {
    await fetch(`${api}/reset${window.location.search}`);

    const localStreams = {
        videoStream: await navigator.mediaDevices.getUserMedia({ audio: false, video: true }),
    };

    const tracks = Array.from(Object.values(localStreams)).reduce((tracks, stream) => {
        return tracks.concat(stream.getTracks());
    }, []);

    let peerConnection = createPeerConnection(tracks);

    localVideo.srcObject = localStreams.videoStream;

    let localOffer = await peerConnection.createOffer();

    await peerConnection.setLocalDescription(localOffer);

    let uniqueIcecandidateListenerLock = false;

    connection.poll(async (message) => {
        const { state, offer, answer } = message;

        console.log(message);

        switch (state) {
            case STATES.new: {
                if (uniqueIcecandidateListenerLock === false) {
                    console.log('icecandidate event listener appended');
                    peerConnection.addEventListener('icecandidate', async (event) => {
                        console.log(event);

                        // if (event.candidate === null) {
                            localOffer = await peerConnection.createOffer();

                            await fetch(`${api}/exchangeDescription${window.location.search}`, {
                                method: 'post',
                                headers: {
                                    'content-type': 'application/json',
                                },
                                body: JSON.stringify({offer: localOffer}),
                            });
    
                            uniqueIcecandidateListenerLock = false;
                        // }
                    }, {
                        once: true,
                    });

                    uniqueIcecandidateListenerLock = true;
                }
            }
            case STATES.offered: {
                if (!offer) {
                    break;
                }

                console.log(new RTCSessionDescription(offer));
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);

                fetch(`${api}/exchangeDescription${window.location.search}`, {
                    method: 'post',
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: JSON.stringify({answer}),
                });

                break;
            }
            case STATES.answered: {
                if (!answer) {
                    break;
                }

                console.log(new RTCSessionDescription(answer));
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));

                break;
            }
            case STATES.icing: {
                break;
            }
            case STATES.connected: {
                break;
            }
        }
    });

    return peerConnection;
};

(async () => {
    window.peer = await connect();
})();
