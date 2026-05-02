// app/routes/room.$code.tsx
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useGame } from "../hooks/useGame";
import GameOverModal from "../components/GameOverModal";
import SpectatorPanel from "../components/SpectatorPanel";
import GameBoardSection from "./room-helpers/components/GameBoardSection";
import { useRoomData } from "./room-helpers/hooks/useRoomData";

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
      console.log("🔄 Sending restart-game event");
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
          </div>
        </div>
      )}
    </>
  );
}
