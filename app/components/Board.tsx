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

  // console.log(
  //   "Board render:",
  //   words.map((w) => ({ word: w.word, revealed: w.isRevealed })),
  // );

  return (
    <div className="w-full px-1 xs:px-2 sm:px-0">
      {/* Turn Indicator */}
      <div className="mb-2 sm:mb-4 text-center">
        <div
          className={`
          inline-block px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-bold text-xs sm:text-base
          ${currentTurn === "red" ? "bg-red-600 text-white" : "bg-blue-600 text-white"}
        `}
        >
          {currentTurn === "red" ? "🔴 Red Team" : "🔵 Blue Team"}'s Turn
          {isCurrentTurn &&
            myRole === "operative" &&
            remainingOperatives > 0 && (
              <span className="mr-1 sm:mr-2 text-[10px] sm:text-sm opacity-80">
                ({remainingOperatives} guesses left)
              </span>
            )}
        </div>
      </div>

      {/* Game Board Grid */}
      <div className="bg-gray-800 rounded-lg p-1 xs:p-2 sm:p-4">
        <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-1 xs:gap-2">
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
      <div className="mt-2 sm:mt-4 text-center text-gray-400 text-[10px] sm:text-sm">
        {isSpymaster && (
          <p className="text-yellow-400">
            🔍 شما Spymaster هستید - رنگ کلمات را می‌بینید!
          </p>
        )}
        {!isSpymaster && myTeam === currentTurn && (
          <p className="text-green-400">
            🎯 نوبت شماست! روی کلماتی که فکر می‌کنید درست هستند کلیک کنید.
          </p>
        )}
        {!isSpymaster && myTeam !== currentTurn && (
          <p className="text-gray-500">
            ⏳ منتظر نوبت {currentTurn === "red" ? "تیم قرمز" : "تیم آبی"}...
          </p>
        )}
      </div>
    </div>
  );
}
