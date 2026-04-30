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

    socket.on("room-update", handleRoomUpdate);
    socket.on("game-started", handleGameStarted);

    return () => {
      socket.off("room-update", handleRoomUpdate);
      socket.off("game-started", handleGameStarted);
    };
  }, [socket, myUserId]);

  return {
    players,
    spectators,
    isCreator,
    gameStatus,
    gameStarted,
    isLoading,
  };
}
