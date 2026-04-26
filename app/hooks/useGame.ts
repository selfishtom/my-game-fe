// frontend/app/hooks/useGame.ts
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import type { GameState, GameWord } from "../interfaces";

export function useGame(
  socket: Socket | null,
  roomCode: string,
  userId: string,
) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleGameStarted = (data: {
      words: GameWord[];
      turn: "red" | "blue";
      remainingGuesses: number;
    }) => {
      console.log("🎮 Game started:", data);
      setGameState({
        words: data.words,
        turn: data.turn,
        redTeam: { spymaster: null, guessers: [], remainingWords: 9 },
        blueTeam: { spymaster: null, guessers: [], remainingWords: 8 },
        remainingGuesses: data.remainingGuesses,
        winner: null,
      });
      setIsGameActive(true);
    };

    const handleGameStateUpdate = (newState: GameState) => {
      console.log("📡 Game state update:", newState);
      setGameState(newState);
    };

    const handleWordRevealed = (data: {
      wordIndex: number;
      color: string;
      isGameOver: boolean;
      newTurn?: "red" | "blue";
      winner?: "red" | "blue" | null;
    }) => {
      console.log("🔓 Word revealed:", data);

      setGameState((prev) => {
        if (!prev) return prev;
        const newWords = [...prev.words];
        if (data.wordIndex >= 0 && data.wordIndex < newWords.length) {
          newWords[data.wordIndex] = {
            ...newWords[data.wordIndex],
            isRevealed: true,
          };
        }
        return {
          ...prev,
          words: newWords,
          turn: data.newTurn || prev.turn,
          winner: data.winner || prev.winner,
        };
      });
    };

    socket.on("game-started", handleGameStarted);
    socket.on("game-state-update", handleGameStateUpdate);
    socket.on("word-revealed", handleWordRevealed);

    return () => {
      socket.off("game-started", handleGameStarted);
      socket.off("game-state-update", handleGameStateUpdate);
      socket.off("word-revealed", handleWordRevealed);
    };
  }, [socket]);

  const makeGuess = (wordIndex: number) => {
    if (socket && gameState) {
      console.log("🔨 Making guess:", wordIndex);
      socket.emit("make-guess", { code: roomCode, userId, wordIndex });
    }
  };

  const giveClue = (clue: string, number: number) => {
    if (socket && gameState) {
      console.log("💡 Giving clue:", clue, number);
      socket.emit("give-clue", { code: roomCode, userId, clue, number });
    }
  };

  const endTurn = () => {
    if (socket && gameState) {
      console.log("⏹️ Ending turn");
      socket.emit("end-turn", { code: roomCode, userId });
    }
  };

  const toggleReady = () => {
    if (socket) {
      console.log("🔄 Toggling ready");
      socket.emit("player-ready", { code: roomCode, userId, isReady: true });
    }
  };

  return {
    gameState,
    isGameActive,
    makeGuess,
    giveClue,
    endTurn,
    toggleReady,
  };
}
