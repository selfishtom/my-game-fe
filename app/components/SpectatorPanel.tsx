// frontend/app/components/SpectatorPanel.tsx
import type { Player } from "../interfaces/game";

interface SpectatorPanelProps {
  spectators: Player[];
  myUserId: string;
  isCreator: boolean;
  onJoinGame: (team: "red" | "blue", role: "spymaster" | "guesser") => void;
}

export default function SpectatorPanel({
  spectators,
  myUserId,
  isCreator,
  onJoinGame,
}: SpectatorPanelProps) {
  const currentSpectator = spectators.find((s) => s.id === myUserId);

  if (!currentSpectator) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold text-yellow-400 mb-3">
        👁️ شما در لیست تماشاگران هستید
      </h2>
      <p className="text-gray-300 mb-4">
        لطفاً تیم و نقش خود را انتخاب کنید تا وارد بازی شوید:
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* تیم قرمز */}
        <div className="border border-red-500 rounded p-3">
          <h3 className="text-red-500 font-bold mb-2">🔴 تیم قرمز</h3>
          <button
            onClick={() => onJoinGame("red", "spymaster")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 rounded text-sm mb-2"
          >
            🎭 Spymaster
          </button>
          <button
            onClick={() => onJoinGame("red", "guesser")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm"
          >
            🎯 Guesser
          </button>
        </div>

        {/* تیم آبی */}
        <div className="border border-blue-500 rounded p-3">
          <h3 className="text-blue-500 font-bold mb-2">🔵 تیم آبی</h3>
          <button
            onClick={() => onJoinGame("blue", "spymaster")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1 rounded text-sm mb-2"
          >
            🎭 Spymaster
          </button>
          <button
            onClick={() => onJoinGame("blue", "guesser")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-1 rounded text-sm"
          >
            🎯 Guesser
          </button>
        </div>
      </div>
    </div>
  );
}
