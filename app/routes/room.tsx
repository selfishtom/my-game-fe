// frontend/app/routes/room.tsx
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useGame } from "../hooks/useGame";
import Board from "../components/Board";
import SpectatorPanel from "../components/SpectatorPanel";
import type { Player } from "../interfaces/game";

export default function RoomPage() {
  const { code } = useParams();
  const roomCode = code || "";
  const isValidCode = roomCode.length === 6;

  const [myUserId, setMyUserId] = useState("");
  const [myPlayerName, setMyPlayerName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<Player[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { socket, isConnected } = useSocket(roomCode, myUserId, myPlayerName);
  const { gameState, isGameActive, makeGuess, giveClue, endTurn } = useGame(
    socket,
    roomCode,
    myUserId,
  );

  // دریافت userId و playerName از localStorage
  useEffect(() => {
    let userId = localStorage.getItem("codenames_userId");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("codenames_userId", userId);
    }
    setMyUserId(userId);

    const playerName = localStorage.getItem("codenames_playerName");
    if (playerName) {
      setMyPlayerName(playerName);
      setIsLoading(false);
    } else {
      window.location.href = "/";
    }
  }, []);

  // گوش دادن به آپدیت‌های روم
  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdate = (data: any) => {
      console.log("📡 [Room] Room update received:", data);
      setPlayers(data.players || []);
      setSpectators(data.spectators || []);
    };

    const handleGameStarted = (data: any) => {
      console.log("🚀 [Room] Game started event received:", data);
      setGameStarted(true);
      setIsLoading(false);
    };

    const handleGameStateUpdate = (state: any) => {
      console.log("🎮 [Room] Game state update received:", state);
    };

    const handleConnect = () => {
      console.log("✅ [Room] Socket connected, ID:", socket.id);
    };

    socket.on("connect", handleConnect);
    socket.on("room-update", handleRoomUpdate);
    socket.on("game-started", handleGameStarted);
    socket.on("game-state-update", handleGameStateUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("room-update", handleRoomUpdate);
      socket.off("game-started", handleGameStarted);
      socket.off("game-state-update", handleGameStateUpdate);
    };
  }, [socket]);

  const handleJoinGame = (
    team: "red" | "blue",
    role: "spymaster" | "guesser",
  ) => {
    if (socket) {
      console.log(`🎮 Joining game as ${team}/${role}`);
      socket.emit("join-game", {
        code: roomCode,
        userId: myUserId,
        team,
        role,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!isValidCode) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="bg-red-900 text-white p-6 rounded-lg text-center">
          <h1 className="text-2xl font-bold mb-2">❌ کد روم نامعتبر</h1>
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded inline-block mt-4"
          >
            بازگشت به صفحه اصلی
          </a>
        </div>
      </div>
    );
  }

  // اگر کاربر در لیست تماشاگران است، پنل انتخاب تیم/نقش را نشان بده
  const isSpectator = spectators.some((s) => s.id === myUserId);

  if (isSpectator && gameStarted && gameState) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between items-center flex-wrap">
            <h1 className="text-xl md:text-2xl text-white">🎮 Codenames</h1>
            <div className="flex gap-4 items-center">
              <span className="text-gray-300">👤 {myPlayerName}</span>
              <span className="text-blue-400">کد روم: {roomCode}</span>
            </div>
          </div>

          <SpectatorPanel
            spectators={spectators}
            myUserId={myUserId}
            isCreator={false}
            onJoinGame={handleJoinGame}
          />

          <div className="mt-4 opacity-50">
            <p className="text-gray-400 text-center mb-2">
              پیش‌نمایش بازی (برای تماشاگران)
            </p>
            <Board
              words={gameState.words}
              currentTurn={gameState.turn}
              myTeam={null}
              myRole={null}
              onGuess={() => {}}
              disabled={true}
            />
          </div>
        </div>
      </div>
    );
  }

  // صفحه بازی فعال برای بازیکنانی که وارد شده‌اند
  if (gameStarted && gameState) {
    const currentPlayer = players.find((p) => p.id === myUserId);
    const myTeam = currentPlayer?.team || null;
    const myRole = currentPlayer?.role || null;
    const isMyTurn = myTeam === gameState.turn;

    console.log("🎮 Rendering game board for:", {
      myUserId,
      myTeam,
      myRole,
      gameStateTurn: gameState.turn,
    });

    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between items-center flex-wrap">
            <h1 className="text-xl md:text-2xl text-white">🎮 Codenames</h1>
            <div className="flex gap-4 items-center">
              <span className="text-gray-300">👤 {myPlayerName}</span>
              <span className="text-blue-400">کد روم: {roomCode}</span>
            </div>
          </div>

          <Board
            words={gameState.words}
            currentTurn={gameState.turn}
            myTeam={myTeam}
            myRole={myRole}
            onGuess={makeGuess}
            disabled={myRole !== "guesser" || !isMyTurn}
            remainingGuesses={gameState.remainingGuesses}
          />

          {myRole === "spymaster" && isMyTurn && (
            <div className="mt-4 bg-gray-800 rounded-lg p-4">
              <h3 className="text-white font-bold mb-2">🗣️ دادن رمز:</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const clue = formData.get("clue") as string;
                  const number = parseInt(formData.get("number") as string);
                  if (clue && number) giveClue(clue, number);
                  e.currentTarget.reset();
                }}
                className="flex gap-2"
              >
                <input
                  name="clue"
                  type="text"
                  placeholder="کلمه رمز..."
                  className="flex-1 bg-gray-700 text-white rounded px-3 py-2"
                />
                <input
                  name="number"
                  type="number"
                  placeholder="عدد"
                  min={1}
                  max={9}
                  className="w-24 bg-gray-700 text-white rounded px-3 py-2"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 px-4 rounded"
                >
                  ارسال
                </button>
              </form>
            </div>
          )}

          {myRole === "guesser" && isMyTurn && (
            <div className="mt-4 text-center">
              <button
                onClick={endTurn}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded transition"
              >
                پایان نوبت →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">در حال بارگذاری بازی...</div>
    </div>
  );
}
