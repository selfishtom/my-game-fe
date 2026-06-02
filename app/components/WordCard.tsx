// app/components/WordCard.tsx
"use client";

interface WordCardProps {
  word: string;
  color: "red" | "blue" | "neutral" | "assassin" | null;
  isRevealed: boolean;
  isSpymaster: boolean;
  isCurrentTurn: boolean;
  isMyTeam: boolean;
  onGuess: () => void;
  disabled?: boolean;
}

export default function WordCard({
  word,
  color,
  isRevealed,
  isSpymaster,
  isCurrentTurn,
  isMyTeam,
  onGuess,
  disabled = false,
}: WordCardProps) {
  // تعیین رنگ کارت بر اساس وضعیت
  const getCardColor = () => {
    if (isRevealed) {
      switch (color) {
        case "red":
          return "bg-red-600 text-white";
        case "blue":
          return "bg-blue-600 text-white";
        case "assassin":
          return "bg-black text-white";
        default:
          return "bg-yellow-600 text-white";
      }
    }

    if (isSpymaster && color) {
      switch (color) {
        case "red":
          return "bg-red-900/50 border-2 border-red-500 text-white";
        case "blue":
          return "bg-blue-900/50 border-2 border-blue-500 text-white";
        case "assassin":
          return "bg-black/50 border-2 border-gray-500 text-white";
        default:
          return "bg-yellow-900/50 border-2 border-yellow-500 text-white";
      }
    }

    return "bg-gray-700 text-white hover:bg-gray-600";
  };

  // آیا کاربر می‌تونه این کارت رو حدس بزنه؟
  const canGuess =
    !isSpymaster && !isRevealed && isCurrentTurn && isMyTeam && !disabled;

  // ایموجی برای کارت‌های باز شده
  const getEmoji = () => {
    if (!isRevealed) return null;
    switch (color) {
      case "red":
        return "🔴";
      case "blue":
        return "🔵";
      case "assassin":
        return "💀";
      case "neutral":
        return "⚪";
      default:
        return null;
    }
  };

  return (
    <button
      onClick={onGuess}
      disabled={!canGuess}
      className={`
        ${getCardColor()}
        p-1 xs:p-2 sm:p-3 md:p-4
        rounded-lg text-center 
        min-h-[50px] xs:min-h-[60px] sm:min-h-[70px] md:min-h-[80px] lg:min-h-[100px]
        transition-all duration-200
        ${canGuess ? "cursor-pointer hover:scale-105 hover:shadow-lg" : "cursor-default"}
        ${disabled ? "opacity-50" : ""}
        text-[10px] xs:text-xs sm:text-sm md:text-base
        break-words
        w-full
      `}
    >
      <p className="font-bold break-words line-clamp-2">{word}</p>
      {getEmoji() && (
        <p className="text-[8px] xs:text-[10px] sm:text-xs mt-0.5 opacity-80">
          {getEmoji()}
        </p>
      )}
    </button>
  );
}
