// frontend/app/components/GameOverModal.tsx
interface GameOverModalProps {
  winner: "red" | "blue" | null;
  message: string;
  onClose: () => void;
  onRestart?: () => void;
}

export default function GameOverModal({
  winner,
  message,
  onClose,
  onRestart,
}: GameOverModalProps) {
  const winnerColor = winner === "red" ? "text-red-500" : "text-blue-500";
  const winnerIcon = winner === "red" ? "🔴" : "🔵";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md text-center">
        <div className="text-6xl mb-4">
          {winner === "red" ? "🔴" : winner === "blue" ? "🔵" : "🤝"}
        </div>
        <h2 className="text-2xl font-bold mb-2 text-white">بازی تمام شد!</h2>
        <p className={`text-xl mb-4 ${winnerColor}`}>{message}</p>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
        >
          بستن
        </button>
        {onRestart && (
          <button
            onClick={onRestart}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
          >
            🔄 بازی جدید
          </button>
        )}
      </div>
    </div>
  );
}
