import { useState } from "react";
import { useRouter } from "next/router";

export default function Join() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const joinMeeting = () => {
    if (!name || !roomId) return alert("Enter name and room ID");
    router.push(`/frontend/meeting?name=${name}&roomId=${roomId}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <input 
        placeholder="Your Name" 
        value={name} 
        onChange={e => setName(e.target.value)} 
        style={{ marginBottom: '10px', padding: '10px', fontSize: '16px' }}
      />
      <input 
        placeholder="Room ID" 
        value={roomId} 
        onChange={e => setRoomId(e.target.value)} 
        style={{ marginBottom: '10px', padding: '10px', fontSize: '16px' }}
      />
      <button 
        onClick={joinMeeting} 
        style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Join Meeting
      </button>
    </div>
  );
}
