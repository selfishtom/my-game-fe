// frontend/app/components/GameMenu.tsx

interface GameMenuProps {
  isCreator: boolean;
  gameStatus: "waiting" | "active" | "finished";
  onRestartGame: () => void;
  onEndGame: () => void;
}

export default function GameMenu({
  isCreator,
  gameStatus,
  onRestartGame,
  onEndGame,
}: GameMenuProps) {
  if (!isCreator) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-3 mb-4 flex gap-3 justify-center">
      {gameStatus === "active" && (
        <>
          <button
            onClick={onRestartGame}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm transition"
          >
            🔄 Restart Game
          </button>
          <button
            onClick={onEndGame}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm transition"
          >
            🏆 End Game
          </button>
        </>
      )}
      {gameStatus === "finished" && (
        <button
          onClick={onRestartGame}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition"
        >
          🔄 Start New Game
        </button>
      )}
    </div>
  );
}
