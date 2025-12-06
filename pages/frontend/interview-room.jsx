import React, { useState, useRef, useEffect } from "react";

const InterviewRoom = () => {
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null); // store stream to stop later

  const startCamera = async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setStreaming(true);
    } catch (err) {
      console.error("Camera error:", err);
      setError("Camera access denied or not available!");
      setStreaming(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setStreaming(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h2>Interview Room</h2>

      {/* Start or Stop Button */}
      {!streaming ? (
        <button
          onClick={startCamera}
          style={{
            padding: "10px 20px",
            background: "green",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Start Interview
        </button>
      ) : (
        <button
          onClick={stopCamera}
          style={{
            padding: "10px 20px",
            background: "red",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Leave Interview
        </button>
      )}

      {/* Error Message */}
      {error && (
        <p style={{ color: "red", marginTop: "10px" }}>
          {error}
        </p>
      )}

      {/* Video Section */}
      {streaming && (
        <div style={{ marginTop: "20px" }}>
          <video
            ref={videoRef}
            width="500"
            height="350"
            autoPlay
            playsInline
            style={{
              border: "2px solid black",
              borderRadius: "8px",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default InterviewRoom;
