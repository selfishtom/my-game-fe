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
  const [showMobileLog, setShowMobileLog] = useState(false); // برای موبایل

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

  const isSpectator = spectators.some((s) => s.id === myUserId);
  const currentPlayer = players.find((p) => p.id === myUserId);
  const isInGame = !isSpectator && currentPlayer !== undefined;

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

  const handleRestartGame = () => {
    if (socket && isCreator) {
      socket.emit("restart-game", { code: roomCode, userId: myUserId });
    }
  };

  const handleTransferOwnership = (targetUserId: string) => {
    if (socket && isCreator) {
      socket.emit("transfer-ownership", {
        code: roomCode,
        userId: myUserId,
        targetUserId,
      });
    }
  };

  const handleKickPlayer = (targetUserId: string) => {
    if (socket && isCreator) {
      socket.emit("kick-user", {
        code: roomCode,
        userId: myUserId,
        targetUserId,
      });
    }
  };

  if (!roomCode || roomCode.length !== 6) return <div>Invalid room code</div>;
  if (isLoading) return <div>Loading...</div>;

  // صفحه بازی فعال
  if (gameStarted && gameState && gameStatus === "active" && isInGame) {
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

        {/* نمایش لاگ در موبایل به صورت modal */}
        {showMobileLog && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-95 p-4 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">📋 تاریخچه بازی</h3>
              <button
                onClick={() => setShowMobileLog(false)}
                className="text-white bg-gray-700 px-3 py-1 rounded"
              >
                ✕ بستن
              </button>
            </div>
            <div className="hidden lg:block lg:w-80 lg:flex-shrink-0 p-4">
              <GameLog socket={socket} roomCode={roomCode} />
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row h-screen bg-gray-900">
          {/* هدر با دکمه لاگ در موبایل */}
          <div className="flex justify-between items-center p-2 bg-gray-800 lg:hidden">
            <div className="text-blue-400 text-sm">کد: {roomCode}</div>
            <button
              onClick={() => setShowMobileLog(true)}
              className="bg-gray-700 px-3 py-1 rounded text-sm"
            >
              📋 تاریخچه
            </button>
            <div className="text-gray-300 text-sm">{myPlayerName}</div>
          </div>

          {/* محتوای اصلی */}
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
              onKickPlayer={handleKickPlayer}
              onTransferOwnership={handleTransferOwnership}
            />
          </div>

          {/* لاگ در دسکتاپ به صورت کناری */}
          <div className="hidden lg:block lg:w-96 xl:w-80 flex-shrink-0 p-4 border-l border-gray-700">
            <GameLog socket={socket} roomCode={roomCode} />
          </div>
        </div>
      </>
    );
  }

  // صفحه لابی
  return (
    <div className="min-h-screen bg-gray-900 p-2 xs:p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between flex-wrap gap-2">
          <h1 className="text-xl sm:text-2xl text-white">🎮 Codenames</h1>
          <div className="text-blue-400 text-sm sm:text-base">
            کد روم: {roomCode}
          </div>
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
          <div className="text-white text-center py-8">در حال بارگذاری...</div>
        )}

        <div className="mt-8 text-center">
          <div className="inline-block p-4 bg-gray-800/50 rounded-lg">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">
              💝 اگر از این بازی لذت می‌برید، حمایت شما باعث ادامه توسعه می‌شود.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="https://donofa.ir/MrFishim/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition text-xs sm:text-sm"
              >
                <span>💝</span>
                <span>حمایت مالی</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
