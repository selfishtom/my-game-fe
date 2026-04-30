// app/components/Board.tsx
"use client";

import WordCard from "./WordCard";
import type { GameWord } from "../interfaces";

interface BoardProps {
  words: GameWord[];
  currentTurn: "red" | "blue";
  myTeam: "red" | "blue" | null;
  myRole: "spymaster" | "operative" | null;
  onGuess: (wordIndex: number) => void;
  disabled?: boolean;
  remainingOperatives?: number;
}

export default function Board({
  words,
  currentTurn,
  myTeam,
  myRole,
  onGuess,
  disabled = false,
  remainingOperatives = 0,
}: BoardProps) {
  const isSpymaster = myRole === "spymaster";
  const isCurrentTurn = myTeam === currentTurn;

  // تقسیم کلمات به ردیف‌های 5 تایی
  const rows: GameWord[][] = [];
  for (let i = 0; i < words.length; i += 5) {
    rows.push(words.slice(i, i + 5));
  }

  return (
    <div className="w-full">
      {/* Turn Indicator */}
      <div className="mb-4 text-center">
        <div
          className={`
          inline-block px-4 py-2 rounded-lg font-bold
          ${currentTurn === "red" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}
        `}
        >
          {currentTurn === "red" ? "🔴 Red Team" : "🔵 Blue Team"}'s Turn
          {isCurrentTurn &&
            myRole === "operative" &&
            remainingOperatives > 0 && (
              <span className="ml-2 text-sm opacity-80">
                ({remainingOperatives} guesses left)
              </span>
            )}
        </div>
      </div>

      {/* Game Board Grid */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {words.map((word, index) => (
            <WordCard
              key={index}
              word={word.word}
              color={word.color}
              isRevealed={word.isRevealed}
              isSpymaster={isSpymaster}
              isCurrentTurn={isCurrentTurn}
              isMyTeam={myTeam === currentTurn}
              onGuess={() => onGuess(index)}
              disabled={disabled || !isCurrentTurn}
            />
          ))}
        </div>
      </div>

      {/* Game Info Footer */}
      <div className="mt-4 text-center text-gray-400 text-sm">
        {isSpymaster && (
          <p className="text-yellow-400">
            🔍 You are the Spymaster - You can see all colors!
          </p>
        )}
        {!isSpymaster && myTeam === currentTurn && (
          <p className="text-green-400">
            🎯 Your turn to guess! Click on words you think match the clue.
          </p>
        )}
        {!isSpymaster && myTeam !== currentTurn && (
          <p className="text-gray-500">
            ⏳ Waiting for {currentTurn === "red" ? "Red" : "Blue"} team...
          </p>
        )}
      </div>
    </div>
  );
}
