// frontend/app/routes/room/hooks/useGameEvents.ts
import { useState, useEffect } from "react";

export function useGameEvents(socket: any) {
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [gameOverWinner, setGameOverWinner] = useState<"red" | "blue" | null>(
    null,
  );

  useEffect(() => {
    if (!socket) return;

    const handleGameOver = (data: {
      winner: "red" | "blue" | null;
      message: string;
    }) => {
      setGameOverWinner(data.winner);
      setGameOverMessage(data.message);
      setShowGameOverModal(true);
    };

    socket.on("game-over", handleGameOver);

    return () => {
      socket.off("game-over", handleGameOver);
    };
  }, [socket]);

  return {
    showGameOverModal,
    gameOverMessage,
    gameOverWinner,
    setShowGameOverModal,
  };
}
