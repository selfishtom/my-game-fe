// context/RoomContext.tsx
"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSocketContext } from "./SocketContext";
import { RoomUpdateData } from "@/types/game";

interface RoomContextType {
  roomCode: string;
  players: RoomUpdateData["players"];
  spectators: RoomUpdateData["spectators"];
  isCreator: boolean;
  gameStatus: "waiting" | "active" | "finished";
  joinRoom: (
    code: string,
    userId: string,
    playerName: string,
    joinAs: "player" | "spectator",
  ) => void;
  toggleReady: () => void;
  startGame: () => void;
  kickUser: (targetUserId: string) => void;
  changeRoomCode: (newCode: string) => Promise<string>;
  leaveRoom: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({
  children,
  initialCode,
  userId,
  playerName,
  joinAs = "player",
}: {
  children: ReactNode;
  initialCode: string;
  userId: string;
  playerName: string;
  joinAs?: "player" | "spectator";
}) {
  const { socket, isConnected } = useSocketContext();
  const [roomCode, setRoomCode] = useState(initialCode);
  const [players, setPlayers] = useState<RoomUpdateData["players"]>([]);
  const [spectators, setSpectators] = useState<RoomUpdateData["spectators"]>(
    [],
  );
  const [isCreator, setIsCreator] = useState(false);
  const [gameStatus, setGameStatus] = useState<
    "waiting" | "active" | "finished"
  >("waiting");

  // پیوستن به روم
  const joinRoom = useCallback(
    (code: string, uid: string, name: string, as: "player" | "spectator") => {
      if (socket && isConnected) {
        console.log("🏠 joinRoom called:", { code, uid, name, as });
        socket.emit("join-room", {
          code,
          userId: uid,
          playerName: name,
          joinAs: as,
        });
      }
    },
    [socket, isConnected],
  );

  // آماده شدن
  const toggleReady = useCallback(() => {
    if (!socket || !isConnected) return;

    const currentPlayer = players.find((p) => p.userId === userId);
    if (currentPlayer) {
      console.log("✅ Toggle ready:", userId, !currentPlayer.isReady);
      socket.emit("player-ready", {
        code: roomCode,
        userId,
        isReady: !currentPlayer.isReady,
      });
    }
  }, [socket, isConnected, roomCode, userId, players]);

  // شروع بازی
  const startGame = useCallback(() => {
    if (!socket || !isConnected || !isCreator) return;

    const readyCount = players.filter((p) => p.isReady).length;
    if (readyCount >= 2) {
      console.log("🚀 Starting game:", roomCode);
      socket.emit("start-game", { code: roomCode, userId });
    } else {
      alert("Need at least 2 ready players to start");
    }
  }, [socket, isConnected, roomCode, userId, isCreator, players]);

  // اخراج کاربر
  const kickUser = useCallback(
    (targetUserId: string) => {
      if (!socket || !isConnected || !isCreator) return;
      console.log("👢 Kicking user:", targetUserId);
      socket.emit("kick-user", { code: roomCode, userId, targetUserId });
    },
    [socket, isConnected, roomCode, userId, isCreator],
  );

  // تغییر کد روم
  const changeRoomCode = useCallback(
    (newCode: string): Promise<string> => {
      return new Promise((resolve, reject) => {
        if (!socket || !isConnected || !isCreator) {
          reject(new Error("Not authorized"));
          return;
        }

        socket.emit(
          "change-room-code",
          { code: roomCode, userId, newCode: newCode.toUpperCase() },
          (response: {
            success: boolean;
            error?: string;
            newCode?: string;
          }) => {
            if (response.success && response.newCode) {
              setRoomCode(response.newCode);
              resolve(response.newCode);
            } else {
              reject(new Error(response.error));
            }
          },
        );
      });
    },
    [socket, isConnected, roomCode, userId, isCreator],
  );

  // خروج از روم
  const leaveRoom = useCallback(() => {
    if (socket && isConnected) {
      console.log("👋 Leaving room:", roomCode);
      socket.emit("leave-room", { code: roomCode, userId });
    }
  }, [socket, isConnected, roomCode, userId]);

  // ============ گوش دادن به رویدادهای Socket ============
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleRoomUpdate = (data: RoomUpdateData) => {
      console.log("🏠 RoomContext - room-update received:", {
        creatorIdFromData: data.creatorId,
        myUserId: userId,
        isCreator: data.creatorId === userId,
      });
      setPlayers(data.players);
      setSpectators(data.spectators);
      setIsCreator(data.creatorId === userId);
      setGameStatus(data.gameStatus);
      if (data.code !== roomCode) {
        setRoomCode(data.code);
      }
    };

    const handleRoomCodeChanged = ({
      newCode,
    }: {
      oldCode: string;
      newCode: string;
    }) => {
      console.log("🔄 Room code changed:", newCode);
      if (!isCreator) {
        setRoomCode(newCode);
      }
    };

    const handleKicked = () => {
      console.log("👢 You were kicked from the room");
    };

    socket.on("room-update", handleRoomUpdate);
    socket.on("room-code-changed", handleRoomCodeChanged);
    socket.on("kicked-from-room", handleKicked);

    return () => {
      socket.off("room-update", handleRoomUpdate);
      socket.off("room-code-changed", handleRoomCodeChanged);
      socket.off("kicked-from-room", handleKicked);
    };
  }, [socket, isConnected, userId, isCreator, roomCode]);

  // اتصال اولیه به روم
  useEffect(() => {
    if (socket && isConnected && userId && playerName) {
      console.log("🔌 Initial join to room:", initialCode);
      joinRoom(initialCode, userId, playerName, joinAs);
    }
  }, [socket, isConnected, userId, playerName, initialCode, joinAs, joinRoom]);

  const value: RoomContextType = {
    roomCode,
    players,
    spectators,
    isCreator,
    gameStatus,
    joinRoom,
    toggleReady,
    startGame,
    kickUser,
    changeRoomCode,
    leaveRoom,
  };

  return <RoomContext.Provider value={value}>{children}</RoomContext.Provider>;
}

export function useRoomContext() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error("useRoomContext must be used within a RoomProvider");
  }
  return context;
}
