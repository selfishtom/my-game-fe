// context/GameContext.tsx
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
import { GameState } from "@/types/game";
import { createInitialGameState } from "@/lib/gameLogic/gameState";

interface GameContextType {
  gameState: GameState;
  isGameOver: boolean;
  winner: "red" | "blue" | null;
  giveClue: (clue: string, number: number) => Promise<boolean>;
  makeGuess: (wordIndex: number) => Promise<boolean>;
  endTurn: () => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({
  children,
  roomCode,
  userId,
}: {
  children: ReactNode;
  roomCode: string;
  userId: string;
}) {
  const { socket, isConnected } = useSocketContext();
  const [gameState, setGameState] = useState<GameState>(
    createInitialGameState(),
  );
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<"red" | "blue" | null>(null);

  // گوش دادن به رویدادهای بازی
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleGameStateUpdate = (newState: GameState) => {
      setGameState(newState);

      // چک کردن برنده
      if (newState.winner) {
        setIsGameOver(true);
        setWinner(newState.winner);
      }
    };

    const handleGameOver = ({
      winner: gameWinner,
    }: {
      winner: "red" | "blue";
    }) => {
      setIsGameOver(true);
      setWinner(gameWinner);
    };

    socket.on("game-state-update", handleGameStateUpdate);
    socket.on("game-over", handleGameOver);

    return () => {
      socket.off("game-state-update", handleGameStateUpdate);
      socket.off("game-over", handleGameOver);
    };
  }, [socket, isConnected]);

  // دادن رمز
  const giveClue = useCallback(
    (clue: string, number: number): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!socket || !isConnected) {
          resolve(false);
          return;
        }

        socket.emit(
          "give-clue",
          { code: roomCode, userId, clue, number },
          (response: { success: boolean; error?: string }) => {
            if (!response.success && response.error) {
              alert(response.error);
            }
            resolve(response.success);
          },
        );
      });
    },
    [socket, isConnected, roomCode, userId],
  );

  // حدس زدن
  const makeGuess = useCallback(
    (wordIndex: number): Promise<boolean> => {
      return new Promise((resolve) => {
        if (!socket || !isConnected) {
          resolve(false);
          return;
        }

        socket.emit(
          "make-guess",
          { code: roomCode, userId, wordIndex },
          (response: {
            success: boolean;
            error?: string;
            gameOver?: boolean;
          }) => {
            if (!response.success && response.error) {
              alert(response.error);
            }
            resolve(response.success);
          },
        );
      });
    },
    [socket, isConnected, roomCode, userId],
  );

  // تموم کردن نوبت
  const endTurn = useCallback(() => {
    if (!socket || !isConnected) return;
    socket.emit("end-turn", { code: roomCode, userId });
  }, [socket, isConnected, roomCode, userId]);

  // ریست بازی
  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setIsGameOver(false);
    setWinner(null);
  }, []);

  const value: GameContextType = {
    gameState,
    isGameOver,
    winner,
    giveClue,
    makeGuess,
    endTurn,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
}
