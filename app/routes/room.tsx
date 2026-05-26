// app/routes/room.$code.tsx
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useGame } from "../hooks/useGame";
import GameOverModal from "../components/GameOverModal";
import SpectatorPanel from "../components/SpectatorPanel";
import GameBoardSection from "./room-helpers/components/GameBoardSection";
import { useRoomData } from "./room-helpers/hooks/useRoomData";
import GameLog from "../components/GameLog";

export default function RoomPage() {
  const { code } = useParams();
  const roomCode = code || "";
  const [myUserId, setMyUserId] = useState("");
  const [myPlayerName, setMyPlayerName] = useState("");

  const { socket, isConnected } = useSocket(roomCode, myUserId, myPlayerName);
  const { gameState, makeGuess, giveClue, endTurn } = useGame(
    socket,
    roomCode,
    myUserId,
  );
  const {
    players,
    spectators,
    isCreator,
    gameStatus,
    gameStarted,
    isLoading,
    showGameOverModal,
    gameOverMessage,
    gameOverWinner,
    setShowGameOverModal,
  } = useRoomData(socket, myUserId);

  useEffect(() => {
    let userId = localStorage.getItem("codenames_userId");
    if (!userId) userId = crypto.randomUUID();
    let name = localStorage.getItem("codenames_playerName");
    if (!name) name = "Guest";
    setMyUserId(userId);
    setMyPlayerName(name);
  }, []);

  const handleJoinGame = (
    team: "red" | "blue",
    role: "spymaster" | "operative",
  ) => {
    if (socket) {
      console.log("DEBUG:", {
        gameStarted,
        gameState,
        gameStatus,
        isInGame,
        players,
        spectators,
      });
      socket.emit("select-team", { code: roomCode, userId: myUserId, team });
      // بعد از انتخاب تیم، نقش را هم تعیین می‌کنیم (در یک مرحله)
      socket.emit("select-role", {
        code: roomCode,
        userId: myUserId,
        team,
        role,
      });
    }
  };

  const handleRestartGame = () => {
    if (socket && isCreator) {
      // console.log("🔄 Sending restart-game event");
      socket.emit("restart-game", { code: roomCode, userId: myUserId });
    }
  };

  if (!roomCode || roomCode.length !== 6) return <div>Invalid room code</div>;
  if (isLoading) return <div>Loading...</div>;

  const isSpectator = spectators.some((s) => s.id === myUserId);
  const currentPlayer = players.find((p) => p.id === myUserId);
  const isInGame = !isSpectator && currentPlayer !== undefined;

  return (
    <>
      {showGameOverModal && (
        <GameOverModal
          winner={gameOverWinner}
          message={gameOverMessage}
          onClose={() => setShowGameOverModal(false)}
          onRestart={handleRestartGame}
        />
      )}

      {gameStarted && gameState && gameStatus === "active" && isInGame ? (
        <div className="flex h-screen overflow-hidden bg-gray-900">
          <div className="flex-1 overflow-auto">
            <GameBoardSection
              roomCode={roomCode}
              playerName={myPlayerName}
              players={players}
              spectators={spectators}
              myUserId={myUserId}
              isCreator={isCreator}
              gameState={gameState}
              onMakeGuess={makeGuess}
              onGiveClue={giveClue}
              onEndTurn={endTurn}
              onKickPlayer={(targetUserId) =>
                socket?.emit("kick-user", {
                  code: roomCode,
                  userId: myUserId,
                  targetUserId,
                })
              }
            />
          </div>

          <div className="w-80 order-first p-4">
            <GameLog socket={socket} roomCode={roomCode} />
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-900 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between">
              <h1 className="text-2xl text-white">🎮 Codenames</h1>
              <div className="text-blue-400">کد روم: {roomCode}</div>
            </div>
            {isSpectator && (
              <SpectatorPanel
                spectators={spectators}
                myUserId={myUserId}
                isCreator={isCreator}
                onJoinGame={handleJoinGame}
              />
            )}
            {!isSpectator && !isInGame && (
              <div className="text-white">در حال بارگذاری...</div>
            )}
            <div className="mt-8 text-center">
              <div className="inline-block p-4 bg-gray-800/50 rounded-lg">
                <p className="text-gray-400 text-sm mb-2">
                  💝 اگر از این بازی لذت می‌برید، حمایت شما باعث ادامه توسعه
                  می‌شود.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <a
                    href="https://donofa.ir/MrFishim/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm"
                  >
                    <span>💝</span>
                    <span>حمایت مالی</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
