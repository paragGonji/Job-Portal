import React, { useState } from "react";

export default function InterviewPage() {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState(""); // default name

  const handleJoin = () => {
    if (!roomId || !name) {
      alert("Please enter both Room ID and Your Name");
      return;
    }
    window.location.href = `/frontend/meeting?room=${roomId}&name=${name}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Join Interview</h1>

        <div className="w-full mb-4">
          <label className="font-semibold text-gray-700">Room ID</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-3 rounded-xl mt-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>

        <div className="w-full mb-6">
          <label className="font-semibold text-gray-700">Your Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 p-3 rounded-xl mt-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button
          onClick={handleJoin}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl text-lg font-semibold shadow-lg transition transform hover:-translate-y-1"
        >
          Join Meeting
        </button>
      </div>
    </div>
  );
}



