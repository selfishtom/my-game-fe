// frontend/app/routes/room/hooks/useRoomData.ts
import { useState, useEffect } from "react";
import type { Player, Spectator } from "../../../interfaces/game";

export function useRoomData(socket: any, myUserId: string) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<Spectator[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [gameStatus, setGameStatus] = useState<
    "waiting" | "active" | "finished"
  >("waiting");
  const [gameStarted, setGameStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [gameOverWinner, setGameOverWinner] = useState<"red" | "blue" | null>(
    null,
  );

  useEffect(() => {
    if (!socket) return;

    const handleRoomUpdate = (data: any) => {
      setPlayers(data.players || []);
      setSpectators(data.spectators || []);
      setIsCreator(data.creatorId === myUserId);
      setGameStatus(data.gameStatus);
      setIsLoading(false);
    };

    const handleGameStarted = (data: any) => {
      setGameStarted(true);
      setGameStatus("active");
      setIsLoading(false);
    };

    const handleGameRestarted = () => {
      console.log("🔄 Game restarted, resetting state");
      setShowGameOverModal(false);
      setGameStarted(false);
      setGameStatus("waiting");
      setIsLoading(true);
      // صفحهRefresh می‌شود و کاربر دوباره به عنوان تماشاگر وارد می‌شود
      window.location.reload(); // یا stateها را ریست کن
    };

    const handleGameOver = (data: {
      winner: "red" | "blue" | null;
      message: string;
    }) => {
      setGameOverWinner(data.winner);
      setGameOverMessage(data.message);
      setShowGameOverModal(true);
    };

    socket.on("room-update", handleRoomUpdate);
    socket.on("game-started", handleGameStarted);
    socket.on("game-over", handleGameOver);
    socket.on("game-restarted", handleGameRestarted);

    return () => {
      socket.off("room-update", handleRoomUpdate);
      socket.off("game-started", handleGameStarted);
      socket.off("game-over", handleGameOver);
      socket.off("game-restarted", handleGameRestarted);
    };
  }, [socket, myUserId]);

  return {
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
  };
}
