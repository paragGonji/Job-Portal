import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { useRouter } from "next/router";

const SOCKET_SERVER_URL = "http://localhost:5000";

const Meeting = () => {
  const router = useRouter();
  const { room, name } = router.query;
  const [peers, setPeers] = useState([]);
  const userVideo = useRef();
  const peersRef = useRef([]);
  const socketRef = useRef();

  useEffect(() => {
    if (!room || !name) return;

    socketRef.current = io(SOCKET_SERVER_URL);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;

        socketRef.current.emit("join-room", { roomId: room, name });

        socketRef.current.on("all-users", (users) => {
          const peersArr = [];
          users.forEach((user) => {
            const peer = createPeer(user.socketId, socketRef.current.id, stream);
            peersRef.current.push({ peerId: user.socketId, peer });
            peersArr.push({ peerId: user.socketId, peer });
          });
          setPeers(peersArr);
        });

        socketRef.current.on("user-joined", (payload) => {
          const peer = addPeer(payload.signal, payload.callerId, stream);
          peersRef.current.push({ peerId: payload.callerId, peer });
          setPeers((users) => [...users, { peerId: payload.callerId, peer }]);
        });

        socketRef.current.on("receiving-returned-signal", (payload) => {
          const item = peersRef.current.find(p => p.peerId === payload.id);
          item.peer.signal(payload.signal);
        });
      });
  }, [room, name]);

  function createPeer(userToSignal, callerId, stream) {
    const peer = new Peer({ initiator: true, trickle: false, stream });
    peer.on("signal", (signal) => {
      socketRef.current.emit("sending-signal", { userToSignal, callerId, signal });
    });
    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({ initiator: false, trickle: false, stream });
    peer.on("signal", (signal) => {
      socketRef.current.emit("returning-signal", { signal, callerId });
    });
    peer.signal(incomingSignal);
    return peer;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      <div>
        <video ref={userVideo} autoPlay playsInline muted style={{ width: "300px", margin: "5px" }} />
        <p>{name} (You)</p>
      </div>
      {peers.map((peerObj) => (
        <Video key={peerObj.peerId} peer={peerObj.peer} />
      ))}
    </div>
  );
};

const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", (stream) => {
      ref.current.srcObject = stream;
    });
  }, [peer]);

  return <video ref={ref} autoPlay playsInline style={{ width: "300px", margin: "5px" }} />;
};

export default Meeting;
