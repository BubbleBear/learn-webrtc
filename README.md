# What is WebRTC

> WebRTC (Web Real-Time Communication) is a technology which enables Web applications and sites to capture and optionally stream audio and/or video media, as well as to exchange arbitrary data between browsers without requiring an intermediary. [referenced from MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

WebRTC consists of 2 parts:
1. Media capture and streams. related APIs are [`navigator.mediaDevices.getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia) etc.;
2. Peer connection, which empower clients to communicate without requiring an intermediary. related primary interface is [`RTCPeerConnection`](https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection).

---

# How does WebRTC work

Media capture and streams is fundamental and straightforward, here's the [API doc](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices);

What may raise our interest is how to deliver the captured media stream from one client to another.

A common approach we come up with is to set up a set of APIs, to enable clients push & pull media. The disadvantage of this approach is that every byte of media user captured must go through our server, which is a significant bandwith cost. And besides, media are captured as streams instead of fragments, which requires real time communication. So we either reduce polling interval or use web socket to exchange media data.

To conquer the above disadvantages, WebRTC introduces P2P communication as it's data exchange method.

## How to set up a peer-to-peer connection

![WebRTC Signaling Diagram](./document/images/webrtc-signaling-diagram.svg)

![WebRTC ICE Candidate Exchange](./document/images/webrtc-ice-candidate-exchange.svg)
