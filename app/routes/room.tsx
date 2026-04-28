// frontend/app/routes/room.tsx
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useGame } from "../hooks/useGame";
import Board from "../components/Board";
import TeamPanel from "../components/TeamPanel";
import SpectatorPanel from "../components/SpectatorPanel";
import type { Player, Spectator } from "../interfaces/game";

export default function RoomPage() {
  const { code } = useParams();
  const roomCode = code || "";
  const isValidCode = roomCode.length === 6;

  const [myUserId, setMyUserId] = useState("");
  const [myPlayerName, setMyPlayerName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<Spectator[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { socket, isConnected } = useSocket(roomCode, myUserId, myPlayerName);
  const { gameState, isGameActive, makeGuess, giveClue, endTurn } = useGame(
    socket,
    roomCode,
    myUserId,
  );

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
    } else {
      window.location.href = "/";
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdate = (data: any) => {
      console.log("📡 [Room] Room update received:", data);
      setPlayers(data.players || []);
      setSpectators(data.spectators || []);
      setIsLoading(false);
    };

    const handleGameStarted = (data: any) => {
      console.log("🚀 [Room] Game started event received:", data);
      setGameStarted(true);
      setIsLoading(false);
    };

    socket.on("room-update", handleRoomUpdate);
    socket.on("game-started", handleGameStarted);

    return () => {
      socket.off("room-update", handleRoomUpdate);
      socket.off("game-started", handleGameStarted);
    };
  }, [socket]);

  const handleJoinGame = (
    team: "red" | "blue",
    role: "spymaster" | "operative",
  ) => {
    if (socket) {
      socket.emit("join-game", {
        code: roomCode,
        userId: myUserId,
        team,
        role,
      });
    }
  };

  const handleTransferOwnership = (targetUserId: string) => {
    if (!socket) return;
    socket.emit("transfer-ownership", {
      code: roomCode,
      userId: myUserId,
      targetUserId,
    });
  };

  const handleKickPlayer = (targetUserId: string) => {
    if (!socket) return;
    socket.emit("kick-user", {
      code: roomCode,
      userId: myUserId,
      targetUserId,
    });
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

  const currentPlayer = players.find((p) => p.id === myUserId);
  const isSpectator = spectators.some((s) => s.id === myUserId);
  const isCreator = players.length > 0 ? players[0]?.id === myUserId : false;

  if (isSpectator && gameStarted && gameState) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between items-center flex-wrap">
            <h1 className="text-xl md:text-2xl text-white">🎮 Codenames</h1>
            <div className="flex gap-4 items-center">
              <span className="text-gray-300">👤 {myPlayerName}</span>
              <span className="text-blue-400">کد روم: {roomCode}</span>
            </div>
          </div>

          {/* پنل تماشاگران با انتخاب تیم */}
          <SpectatorPanel
            spectators={spectators}
            myUserId={myUserId}
            isCreator={isCreator}
            onJoinGame={handleJoinGame}
            onKickPlayer={handleKickPlayer}
          />

          {/* پیش‌نمایش بازی */}
          <div className="opacity-50">
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
    //const currentPlayer = players.find((p) => p.id === myUserId);
    const myTeam = currentPlayer?.team || null;
    const myRole = currentPlayer?.role || null;
    const isMyTurn = myTeam === gameState.turn;

    return (
      <div className="min-h-screen bg-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between items-center flex-wrap">
            <h1 className="text-xl md:text-2xl text-white">🎮 Codenames</h1>
            <div className="flex gap-4 items-center">
              <span className="text-gray-300">👤 {myPlayerName}</span>
              <span className="text-blue-400">کد روم: {roomCode}</span>
            </div>
          </div>

          {/* لیست تماشاگران */}
          {spectators.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-3 mb-4">
              <h2 className="text-gray-400 font-bold mb-1 text-sm">
                👁️ تماشاگران ({spectators.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                {spectators.map((spectator) => (
                  <div
                    key={spectator.id}
                    className="bg-gray-700 px-2 py-0.5 rounded-full text-xs"
                  >
                    {spectator.name}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* دو طرف: تیم آبی چپ، تیم قرمز راست, Board وسط */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* تیم آبی - سمت چپ */}
            <div className="md:w-64 order-1">
              <TeamPanel
                team="blue"
                players={players}
                myUserId={myUserId}
                isCreator={isCreator}
                gameStatus="active"
                onTransferOwnership={handleTransferOwnership}
                onKickPlayer={handleKickPlayer}
              />
            </div>

            {/* Board - وسط */}
            <div className="flex-1 order-2">
              <Board
                words={gameState.words}
                currentTurn={gameState.turn}
                myTeam={myTeam}
                myRole={myRole}
                onGuess={makeGuess}
                disabled={myRole !== "operative" || !isMyTurn}
                remainingGuesses={gameState.remainingGuesses}
              />

              {gameState.currentClue && (
                <div className="mb-4 bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-sm">رمز داده شده:</p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {gameState.currentClue.clue} -{" "}
                    {gameState.currentClue.number}
                  </p>
                </div>
              )}

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
                      placeholder="سرنخ..."
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
              {myRole === "operative" && isMyTurn && (
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

            {/* تیم قرمز - سمت راست */}
            <div className="md:w-64 order-3">
              <TeamPanel
                team="red"
                players={players}
                myUserId={myUserId}
                isCreator={isCreator}
                gameStatus="active"
                onTransferOwnership={handleTransferOwnership}
                onKickPlayer={handleKickPlayer}
              />
            </div>
          </div>
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
