// hooks/useRoom.ts
import { useState, useCallback } from "react";
import { Socket } from "socket.io-client";

interface Player {
  userId: string;
  name: string;
  isReady: boolean;
}

interface Spectator {
  userId: string;
  name: string;
}

export function useRoom(
  socket: Socket | null,
  roomCode: string,
  userId: string,
) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [spectators, setSpectators] = useState<Spectator[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [gameStatus, setGameStatus] = useState<
    "waiting" | "active" | "finished"
  >("waiting");

  const toggleReady = useCallback(() => {
    if (!socket) return;

    const currentPlayer = players.find((p) => p.userId === userId);
    if (currentPlayer) {
      socket.emit("player-ready", {
        code: roomCode,
        userId,
        isReady: !currentPlayer.isReady,
      });
    }
  }, [socket, roomCode, userId, players]);

  const startGame = useCallback(() => {
    if (!socket || !isCreator) return;

    const readyCount = players.filter((p) => p.isReady).length;
    if (readyCount >= 2) {
      socket.emit("start-game", { code: roomCode, userId });
    } else {
      alert("Need at least 2 ready players to start");
    }
  }, [socket, roomCode, userId, isCreator, players]);

  const changeRoomCode = useCallback(
    async (newCode: string) => {
      if (!socket || !isCreator) return;

      return new Promise((resolve, reject) => {
        socket.emit(
          "change-room-code",
          { code: roomCode, userId, newCode: newCode.toUpperCase() },
          (response: {
            success: boolean;
            error?: string;
            newCode?: string;
          }) => {
            if (response.success) {
              resolve(response.newCode);
            } else {
              reject(new Error(response.error));
            }
          },
        );
      });
    },
    [socket, roomCode, userId, isCreator],
  );

  const kickUser = useCallback(
    (targetUserId: string) => {
      if (!socket || !isCreator) return;
      socket.emit("kick-user", { code: roomCode, userId, targetUserId });
    },
    [socket, roomCode, userId, isCreator],
  );

  const updateRoomData = useCallback(
    (data: any) => {
      setPlayers(data.players);
      setSpectators(data.spectators);
      setIsCreator(data.creatorId === userId);
      setGameStatus(data.gameStatus);
    },
    [userId],
  );

  return {
    players,
    spectators,
    isCreator,
    gameStatus,
    toggleReady,
    startGame,
    changeRoomCode,
    kickUser,
    updateRoomData,
  };
}
