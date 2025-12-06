import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import { useRouter } from "next/router";
import Link from "next/link";

const SOCKET_SERVER_URL = "http://localhost:5000";

const Meeting = () => {
  const router = useRouter();
  const { room, name } = router.query;

  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [peers, setPeers] = useState([]);

  const userVideo = useRef();
  const peersRef = useRef([]);
  const streamRef = useRef(null);
  const socketRef = useRef();
  const [ready, setReady] = useState(false);

  // Wait for router query
  useEffect(() => {
    if (router.isReady && room && name) {
      setReady(true);
    }
  }, [router.isReady, room, name]);

  // Attach stream to video element
  useEffect(() => {
    if (streaming && streamRef.current && userVideo.current) {
      userVideo.current.srcObject = streamRef.current;
      const playVideo = async () => {
        try {
          await userVideo.current.play();
        } catch (err) {
          console.error("Video play failed:", err);
        }
      };
      playVideo();
    }
  }, [streaming]);

  const startCamera = async () => {
    if (!ready) return;

    try {
      setError("");

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: true,
      });

      streamRef.current = stream;
      setStreaming(true);

      // Socket connection
      socketRef.current = io(SOCKET_SERVER_URL);
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
        setPeers((prev) => [...prev, { peerId: payload.callerId, peer }]);
      });

      socketRef.current.on("receiving-returned-signal", (payload) => {
        const item = peersRef.current.find((p) => p.peerId === payload.id);
        if (item) item.peer.signal(payload.signal);
      });
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or not available");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    setStreaming(false);
    setPeers([]);
    if (socketRef.current) socketRef.current.disconnect();
  };

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-8 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Interview Room</h2>
        <p className="text-gray-600 mb-1">
          Room: <span className="font-medium">{room || "loading..."}</span>
        </p>
        <p className="text-gray-600 mb-6">
          Name: <span className="font-medium">{name || "loading..."}</span>
        </p>

        {/* Start / Leave buttons */}
        {!streaming ? (
          <button
            onClick={startCamera}
            className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition mb-6 shadow-lg"
          >
            Start Interview
          </button>
        ) : (
          <button
            onClick={stopCamera}
            className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition mb-6 shadow-lg"
          >
            Leave Interview
          </button>
        )}

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Camera feed or placeholder */}
        <div className="w-full flex flex-col items-center">
          {streaming ? (
            <div className="flex flex-col items-center">
              <video
                ref={userVideo}
                autoPlay
                playsInline
                muted
                className="w-96 h-56 rounded-2xl border-4 border-gray-300 shadow-lg mb-2 object-cover"
              />
              <p className="text-gray-700 font-medium">{name} (You)</p>
            </div>
          ) : (
            <div className="w-full max-w-2xl h-64 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 shadow-inner mb-4">
              <svg
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500 text-lg font-medium">
                Camera feed will appear here
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Click "Start Interview" to begin
              </p>
            </div>
          )}
        </div>

        {/* Peer videos */}
        {peers.length > 0 && (
          <div className="flex flex-wrap justify-center mt-6">
            {peers.map((peerObj) => (
              <Video key={peerObj.peerId} peer={peerObj.peer} />
            ))}
          </div>
        )}

        {/* Back + Home Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition duration-200 shadow-md flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>

          {/* Home Button */}
          <Link href="/">
            <button className="bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition duration-200 shadow-md flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const Video = ({ peer }) => {
  const ref = useRef();

  useEffect(() => {
    peer.on("stream", (stream) => {
      if (ref.current) {
        ref.current.srcObject = stream;
      }
    });
  }, [peer]);

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      className="w-72 h-48 m-2 border-4 border-gray-300 rounded-2xl shadow-md object-cover"
    />
  );
};

export default Meeting;
