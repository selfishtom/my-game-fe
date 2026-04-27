// frontend/app/routes/home.tsx
import { useState } from "react";
import { useNavigate } from "react-router";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default function HomePage() {
  const [roomCode, setRoomCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/create-room`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success && data.code) {
        // ذخیره نام کاربر در localStorage
        localStorage.setItem("codenames_playerName", playerName.trim());
        navigate(`/room/${data.code}`);
      } else {
        throw new Error(data.error || "Can't make room");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError("Please enter your name");
      return;
    }
    if (roomCode.length !== 6) {
      setError("The room code must be 6 digits");
      return;
    }

    localStorage.setItem("codenames_playerName", playerName.trim());
    navigate(`/room/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-white mb-8">
          🎮 Codenames
        </h1>

        {/* ورود نام کاربر */}
        <div className="mb-6">
          <label className="block text-gray-300 mb-2">نام شما:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="مثال: علی"
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateRoom}
          disabled={isLoading || !playerName.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition mb-4"
        >
          {isLoading ? "در حال ساخت..." : "✨ ساخت روم جدید"}
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">یا</span>
          </div>
        </div>

        <form onSubmit={handleJoinRoom} className="space-y-4">
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="کد 6 رقمی"
            maxLength={6}
            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={roomCode.length !== 6 || !playerName.trim()}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            ورود به روم
          </button>
        </form>
      </div>
    </div>
  );
}
