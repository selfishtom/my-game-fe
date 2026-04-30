// frontend/app/hooks/useGame.ts
import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import type { GameState, GameWord } from "../interfaces/game";

export function useGame(
  socket: Socket | null,
  roomCode: string,
  userId: string,
) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // رویداد شروع بازی (برای کاربر اول)
    const handleGameStarted = (data: {
      words: GameWord[];
      turn: "red" | "blue";
      remainingOperatives: number;
    }) => {
      console.log("🎮 [useGame] Game started event received:", data);

      // محاسبه تعداد کلمات باقی‌مانده برای هر تیم
      const redCount = data.words.filter((w) => w.color === "red").length;
      const blueCount = data.words.filter((w) => w.color === "blue").length;

      const newGameState: GameState = {
        words: data.words,
        turn: data.turn,
        redTeam: {
          spymaster: null,
          operatives: [],
          remainingWords: redCount,
        },
        blueTeam: {
          spymaster: null,
          operatives: [],
          remainingWords: blueCount,
        },
        remainingOperatives: data.remainingOperatives,
        currentClue: undefined,
        winner: null,
      };

      setGameState(newGameState);
      setIsGameActive(true);
    };

    // رویداد همگام‌سازی وضعیت بازی (برای کاربرانی که بعداً وارد می‌شوند)
    const handleGameStateSync = (data: {
      words: GameWord[];
      turn: "red" | "blue";
      remainingOperatives: number;
      currentClue?: { clue: string; number: number; giverId: string };
      redTeam: {
        spymaster: string | null;
        operatives: string[];
        remainingWords: number;
      };
      blueTeam: {
        spymaster: string | null;
        operatives: string[];
        remainingWords: number;
      };
      winner: "red" | "blue" | null;
    }) => {
      console.log("🔄 [useGame] Game state sync received:", data);

      setGameState({
        words: data.words,
        turn: data.turn,
        redTeam: data.redTeam,
        blueTeam: data.blueTeam,
        remainingOperatives: data.remainingOperatives,
        currentClue: data.currentClue,
        winner: data.winner,
      });
      setIsGameActive(true);
    };

    // رویداد به‌روزرسانی وضعیت بازی (در حین بازی)
    const handleGameStateUpdate = (newState: Partial<GameState>) => {
      console.log("🎮 [useGame] Game state update received:", newState);
      setGameState((prev) => (prev ? { ...prev, ...newState } : null));
    };

    // رویداد باز شدن کارت
    const handleWordRevealed = (data: {
      wordIndex: number;
      color: string;
      isGameOver: boolean;
      newTurn?: "red" | "blue";
      winner?: "red" | "blue" | null;
    }) => {
      console.log("🔓 [useGame] Word revealed:", data);

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

    // رویداد رمز داده شده
    const handleClueGiven = (data: {
      clue: string;
      number: number;
      turn: "red" | "blue";
      remainingOperatives: number;
    }) => {
      console.log("💡 [useGame] Clue given:", data);

      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          remainingOperatives: data.remainingOperatives,
          currentClue: { clue: data.clue, number: data.number, giverId: "" },
        };
      });
    };

    // رویداد پایان بازی
    const handleGameOver = (data: {
      winner: "red" | "blue" | null;
      message: string;
      isAssassinLoss?: boolean;
    }) => {
      console.log("🏆 [useGame] Game over:", data);
      setIsGameActive(false);
      setGameState((prev) => (prev ? { ...prev, winner: data.winner } : null));

      // نمایش پیام به کاربر (می‌توانید از toast یا alert استفاده کنید)
      if (data.isAssassinLoss) {
        alert(`💀 کارت قاتل باز شد! ${data.message}`);
      } else {
        alert(`🎉 ${data.message}`);
      }
    };

    // رویداد تغییر نوبت
    const handleTurnChanged = (data: { turn: "red" | "blue" }) => {
      console.log("🔄 [useGame] Turn changed, clearing current clue:", data);
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          turn: data.turn,
          currentClue: undefined,
          remainingOperatives: 0,
        };
      });
    };

    // ثبت شنوندگان
    socket.on("game-started", handleGameStarted);
    socket.on("game-state-sync", handleGameStateSync);
    socket.on("game-state-update", handleGameStateUpdate);
    socket.on("word-revealed", handleWordRevealed);
    socket.on("clue-given", handleClueGiven);
    socket.on("game-over", handleGameOver);
    socket.on("turn-changed", handleTurnChanged);

    console.log("🎮 [useGame] Socket listeners registered");

    return () => {
      socket.off("game-started", handleGameStarted);
      socket.off("game-state-sync", handleGameStateSync);
      socket.off("game-state-update", handleGameStateUpdate);
      socket.off("word-revealed", handleWordRevealed);
      socket.off("clue-given", handleClueGiven);
      socket.off("game-over", handleGameOver);
      socket.off("turn-changed", handleTurnChanged);
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
    makeGuess,
    giveClue,
    endTurn,
  };
}
