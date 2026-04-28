// frontend/app/hooks/useGame.ts
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import type { GameState, GameWord } from "../interfaces/game";

// prettier-ignore
export function useGame(  socket: Socket | null,  roomCode: string,  userId: string) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [currentClue, setCurrentClue] = useState<{ clue: string; number: number } | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleGameStarted = (data: {words: GameWord[]; turn: "red" | "blue"; remainingGuesses: number;}) => 
    {
      console.log("🎮 [useGame] Game started event received:", data);

      // محاسبه تعداد کلمات باقی‌مانده برای هر تیم
      const redCount = data.words.filter((w) => w.color === "red").length;
      const blueCount = data.words.filter((w) => w.color === "blue").length;

      const newGameState: GameState = {
        words: data.words,
        turn: data.turn,
        redTeam: {
          spymaster: null,
          guessers: [],
          remainingWords: redCount,
        },
        blueTeam: {
          spymaster: null,
          guessers: [],
          remainingWords: blueCount,
        },
        remainingGuesses: data.remainingGuesses,
        winner: null,
      };

      setGameState(newGameState);
      setIsGameActive(true);
    };

    const handleGameStateUpdate = (newState: any) => {
      console.log("🎮 [useGame] Game state update received:", newState);
      setGameState((prev) => (prev ? { ...prev, ...newState } : null));
    };

    const handleWordRevealed = (data: { wordIndex: number; color: string; isGameOver: boolean; newTurn?: "red" | "blue"; winner?: "red" | "blue" | null;}) => 
    {
      console.log("🔓 [useGame] Word revealed:", data);

      setGameState((prev) => {
        if (!prev) return prev;
        const newWords = [...prev.words];
        if (data.wordIndex >= 0 && data.wordIndex < newWords.length) 
        {
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

    // 🔥 اضافه کردن گوش دادن به رویداد clue-given
    const handleClueGiven = (data: { clue: string; number: number; turn: 'red' | 'blue'; remainingGuesses: number }) => {
      console.log("💡 [useGame] Clue given:", data);
      setCurrentClue({ clue: data.clue, number: data.number });
      
      // همچنین می‌توانیم remainingGuesses را در gameState به‌روز کنیم
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          remainingGuesses: data.remainingGuesses,
          currentClue: { clue: data.clue, number: data.number, giverId: '' }
        };
      });
    };

    socket.on('game-started', handleGameStarted);
    socket.on('game-state-update', handleGameStateUpdate);
    socket.on('word-revealed', handleWordRevealed);
    socket.on('clue-given', handleClueGiven);

    console.log("🎮 [useGame] Socket listeners registered");

    return () => {
      socket.off('game-started', handleGameStarted);
      socket.off('game-state-update', handleGameStateUpdate);
      socket.off('word-revealed', handleWordRevealed);
      socket.off('clue-given', handleClueGiven);
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

  return {
    gameState,
    isGameActive,
    currentClue,
    makeGuess,
    giveClue,
    endTurn
  };
}
