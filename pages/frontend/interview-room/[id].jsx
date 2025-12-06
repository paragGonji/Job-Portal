import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

const InterviewRoomPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Handle video element when streaming changes
  useEffect(() => {
    if (streaming && streamRef.current && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      
      const playVideo = async () => {
        try {
          await video.play();
          console.log("Video playing successfully");
        } catch (err) {
          console.error("Failed to play video:", err);
          setError("Failed to play video");
        }
      };
      
      playVideo();
    } else if (!streaming && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [streaming]);

  const startCamera = async () => {
    try {
      setError("");
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true,
      });

      streamRef.current = stream;
      setStreaming(true);
      
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or not available: " + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  };

  const handleJoinInterview = () => {
    if (!joinCode.trim()) {
      setError("Please enter a meeting code");
      return;
    }
    router.push(`/frontend/interview-room/${joinCode.trim()}`);
  };

  const copyRoomLink = () => {
    const roomLink = `${window.location.origin}/frontend/interview-room/${id}`;
    navigator.clipboard.writeText(roomLink);
    alert("Room link copied to clipboard!");
  };

  const generateNewRoom = () => {
    const newId = Math.random().toString(36).substring(2, 10);
    router.push(`/frontend/interview-room/${newId}`);
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Interview Room</h1>
          <div className="w-24 h-1 bg-indigo-600 mx-auto"></div>
          <p className="text-lg text-gray-600 mt-4">
            Room ID: <span className="font-mono font-bold text-indigo-600">{id || "loading..."}</span>
          </p>
        </div>

        {/* Room Actions Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Room Actions</h2>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Current Room Info */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Current Room
              </h3>
              <div className="space-y-3">
                <p className="text-blue-600 break-all">
                  <strong>ID:</strong> {id || "loading..."}
                </p>
                <button
                  onClick={copyRoomLink}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Room Link
                </button>
                <button
                  onClick={generateNewRoom}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create New Room
                </button>
              </div>
            </div>

            {/* Join Another Room */}
            <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Join Another Room
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter Room Code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleJoinInterview()}
                />
                <button
                  onClick={handleJoinInterview}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Join Room
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Camera Control Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          {!streaming ? (
            <button
              onClick={startCamera}
              className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-green-700 transition duration-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Start Interview
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-700 transition duration-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Leave Interview
            </button>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
              <p className="text-red-600 font-semibold flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Video Preview Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Camera Preview - {streaming ? "Live" : "Offline"}
            </h2>
            <div className="w-16 h-0.5 bg-gray-300 mx-auto"></div>
          </div>
          
          <div className="flex justify-center">
            {streaming ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-2xl h-96 bg-black rounded-2xl shadow-lg object-cover"
              />
            ) : (
              <div className="w-full max-w-2xl h-96 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">Camera feed will appear here</p>
                <p className="text-gray-400 text-sm mt-2">Click "Start Interview" to begin</p>
              </div>
            )}
          </div>
        </div>

        {/* Go Home Button */}
        <div className="text-center">
          <Link href="/">
            <button className="bg-gray-700 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition duration-200 shadow-md hover:shadow-lg flex items-center gap-2 mx-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewRoomPage;