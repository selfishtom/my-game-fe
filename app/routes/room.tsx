// frontend/app/routes/room.tsx
import { useParams } from "react-router";
import { useState, useEffect } from "react";
import { useSocket } from "../hooks/useSocket";
import { useGame } from "../hooks/useGame";
import Lobby from "../components/Lobby";
import Board from "../components/Board";
import TeamPanel from "../components/TeamPanel";
import GameMenu from "../components/GameMenu";
import type { Player } from "../interfaces/game";

export default function RoomPage() {
  const { code } = useParams();
  const roomCode = code || "";
  const isValidCode = roomCode.length === 6;

  const [myUserId, setMyUserId] = useState("");
  const [myPlayerName, setMyPlayerName] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameStatus, setGameStatus] = useState<
    "waiting" | "active" | "finished"
  >("waiting");

  const {
    socket,
    isConnected,
    error: socketError,
  } = useSocket(roomCode, myUserId, myPlayerName);
  const { gameState, isGameActive, makeGuess, giveClue, endTurn, toggleReady } =
    useGame(socket, roomCode, myUserId);

  // دریافت userId و playerName از localStorage
  useEffect(() => {
    let userId = localStorage.getItem("codenames_userId");
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem("codenames_userId", userId);
    }
    setMyUserId(userId);

    let playerName = localStorage.getItem("codenames_playerName");
    if (!playerName) {
      playerName = `Player${Math.floor(Math.random() * 1000)}`;
      localStorage.setItem("codenames_playerName", playerName);
    }
    setMyPlayerName(playerName);
  }, []);

  // گوش دادن به آپدیت‌های روم
  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdate = (data: any) => {
      console.log("📡 Room update:", data);
      setPlayers(data.players || []);
      setIsCreator(data.creatorId === myUserId);
      setGameStatus(data.gameStatus);
    };

    const handleGameStarted = (data: any) => {
      console.log("🚀 Game started event received:", data);
      setGameStarted(true);
      setGameStatus("active");
    };

    const handleGameOver = (data: { winner: "red" | "blue" | null }) => {
      console.log("🏆 Game over:", data);
      setGameStatus("finished");
    };

    const handleError = (data: { error: string }) => {
      console.error("❌ Error from server:", data.error);
      alert(data.error);
    };

    socket.on("room-update", handleRoomUpdate);
    socket.on("game-started", handleGameStarted);
    socket.on("game-over", handleGameOver);
    socket.on("error", handleError);

    return () => {
      socket.off("room-update", handleRoomUpdate);
      socket.off("game-started", handleGameStarted);
      socket.off("game-over", handleGameOver);
      socket.off("error", handleError);
    };
  }, [socket, myUserId]);

  // انتخاب تیم برای یک کاربر (توسط خودش یا سازنده)
  const handleSelectTeam = (targetUserId: string, team: "red" | "blue") => {
    if (!socket || gameStatus !== "waiting") return;
    if (targetUserId !== myUserId && !isCreator) return;
    socket.emit("select-team", { code: roomCode, userId: targetUserId, team });
  };

  // انتخاب نقش توسط کاربر فعلی
  const handleSelectRole = (
    team: "red" | "blue",
    role: "spymaster" | "guesser",
  ) => {
    if (!socket || gameStatus !== "waiting") return;
    const currentPlayer = players.find((p) => p.id === myUserId);
    if (currentPlayer?.team !== team) return;
    socket.emit("select-role", {
      code: roomCode,
      userId: myUserId,
      team,
      role,
    });
  };

  // تغییر تیم (برای کسانی که قبلاً تیم انتخاب کرده‌اند)
  const handleSwitchTeam = (team: "red" | "blue") => {
    if (!socket || gameStatus !== "waiting") return;

    socket.emit("switch-team", {
      code: roomCode,
      userId: myUserId,
      newTeam: team,
    });
  };

  // تغییر نقش
  const handleSwitchRole = (role: "spymaster" | "guesser") => {
    if (!socket || gameStatus !== "waiting") return;
    const currentPlayer = players.find((p) => p.id === myUserId);
    if (currentPlayer?.team) {
      console.log(`🔄 Switching to ${role}`);
      socket.emit("switch-role", {
        code: roomCode,
        userId: myUserId,
        team: currentPlayer.team,
        role,
      });
    }
  };

  const handleKickPlayer = (targetUserId: string) => {
    if (!socket || !isCreator) return;
    socket.emit("kick-user", {
      code: roomCode,
      userId: myUserId,
      targetUserId,
    });
  };

  const handleRestartGame = () => {
    if (!socket || !isCreator) return;
    socket.emit("restart-game", { code: roomCode, userId: myUserId });
    setGameStarted(false);
    setGameStatus("waiting");
  };

  const handleEndGame = () => {
    if (!socket || !isCreator) return;
    socket.emit("end-game", { code: roomCode, userId: myUserId });
  };

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

  // صفحه بازی فعال
  if (gameStarted && gameState && gameStatus === "active") {
    const currentPlayer = players.find((p) => p.id === myUserId);
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

          {/* Game Menu for creator */}
          <GameMenu
            isCreator={isCreator}
            gameStatus={gameStatus}
            onRestartGame={handleRestartGame}
            onEndGame={handleEndGame}
          />

          {/* Main Game Area with Teams on sides and Board in middle */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Red Team Panel - Left Side */}
            <TeamPanel
              team="red"
              players={players}
              myUserId={myUserId}
              isCreator={isCreator}
              gameStatus={gameStatus}
              onSelectTeam={handleSelectTeam}
              onSelectRole={handleSelectRole}
              onSwitchTeam={() => handleSwitchTeam("blue")}
              onSwitchRole={() => handleSwitchRole("spymaster")}
              onKickPlayer={handleKickPlayer}
            />

            {/* Board - Center */}
            <div className="flex-1">
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

            {/* Blue Team Panel - Right Side */}
            <TeamPanel
              team="blue"
              players={players}
              myUserId={myUserId}
              isCreator={isCreator}
              gameStatus={gameStatus}
              onSelectTeam={handleSelectTeam}
              onSelectRole={handleSelectRole}
              onSwitchTeam={() => handleSwitchTeam("red")}
              onSwitchRole={() => handleSwitchRole("spymaster")}
              onKickPlayer={handleKickPlayer}
            />
          </div>
        </div>
      </div>
    );
  }

  // صفحه لابی (منتظر شروع بازی)
  const currentPlayer = players.find((p) => p.id === myUserId);
  const isReady = currentPlayer?.isReady || false;
  const isSpectator = currentPlayer?.team === null;

  // شمارش تعداد بازیکنانی که در تیم‌ها هستند (برای شروع بازی)
  const playersInTeams = players.filter((p) => p.team !== null);
  const redTeamReady =
    players.some((p) => p.team === "red" && p.role === "spymaster") &&
    players.some((p) => p.team === "red" && p.role === "guesser");
  const blueTeamReady =
    players.some((p) => p.team === "blue" && p.role === "spymaster") &&
    players.some((p) => p.team === "blue" && p.role === "guesser");
  const canStart = redTeamReady && blueTeamReady && playersInTeams.length >= 4;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">
          🎮 Codenames Room
        </h1>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <p className="text-center text-xl">
            کد روم: <span className="font-mono text-blue-400">{roomCode}</span>
          </p>
          <p className="text-center mt-2">
            وضعیت: {isConnected ? "✅ متصل" : "❌ در حال اتصال..."}
          </p>
          {socketError && (
            <p className="text-center text-red-400 text-sm mt-2">
              خطا: {socketError}
            </p>
          )}
        </div>

        {/* Team selection in lobby */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <TeamPanel
            team="red"
            players={players}
            myUserId={myUserId}
            isCreator={isCreator}
            gameStatus={gameStatus}
            onSelectTeam={handleSelectTeam}
            onSelectRole={handleSelectRole}
            onSwitchTeam={() => handleSwitchTeam("blue")}
            onSwitchRole={() => handleSwitchRole("guesser")}
            onKickPlayer={handleKickPlayer}
          />
          <TeamPanel
            team="blue"
            players={players}
            myUserId={myUserId}
            isCreator={isCreator}
            gameStatus={gameStatus}
            onSelectTeam={handleSelectTeam}
            onSelectRole={handleSelectRole}
            onSwitchTeam={() => handleSwitchTeam("red")}
            onSwitchRole={() => handleSwitchRole("guesser")}
            onKickPlayer={handleKickPlayer}
          />
        </div>

        {/* Start Game Button */}
        <div className="flex flex-col gap-4">
          {isSpectator && (
            <div className="bg-yellow-900/50 p-3 rounded-lg text-center text-yellow-400 text-sm">
              ⚠️ لطفاً ابتدا تیم خود را انتخاب کنید
            </div>
          )}

          {!isSpectator && (
            <button
              onClick={toggleReady}
              className="w-full bg-green-600 hover:bg-green-700 py-2 rounded transition"
            >
              {isReady ? "❌ نه آماده" : "✅ آماده"}
            </button>
          )}

          {isCreator && (
            <button
              onClick={() => {
                if (canStart) {
                  if (socket)
                    socket.emit("start-game", {
                      code: roomCode,
                      userId: myUserId,
                    });
                } else {
                  alert(
                    "برای شروع بازی هر تیم باید حداقل یک Spymaster و یک Guesser داشته باشد",
                  );
                }
              }}
              disabled={!canStart}
              className={`w-full py-2 rounded transition ${
                canStart
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 cursor-not-allowed"
              }`}
            >
              🚀 شروع بازی
            </button>
          )}

          {!canStart && isCreator && (
            <p className="text-yellow-500 text-center text-sm">
              ⚠️ هر تیم باید حداقل یک Spymaster و یک Guesser داشته باشد
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
