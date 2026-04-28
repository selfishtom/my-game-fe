// frontend/app/components/SpectatorPanel.tsx
import type { Spectator } from "../interfaces/game";

interface SpectatorPanelProps {
  spectators: Spectator[];
  myUserId: string;
  isCreator: boolean;
  onJoinGame: (team: "red" | "blue", role: "spymaster" | "operative") => void;
  onKickPlayer?: (userId: string) => void;
}

export default function SpectatorPanel({
  spectators,
  myUserId,
  isCreator,
  onJoinGame,
  onKickPlayer,
}: SpectatorPanelProps) {
  const currentSpectator = spectators.find((s) => s.id === myUserId);

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h2 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
        👁️ تماشاگران ({spectators.length})
      </h2>

      {/* لیست تماشاگران */}
      <div className="flex flex-wrap gap-2 mb-4">
        {spectators.length === 0 ? (
          <p className="text-gray-500 text-sm">هیچ تماشاگری وجود ندارد</p>
        ) : (
          spectators.map((spectator) => (
            <div
              key={spectator.id}
              className="bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              <span>{spectator.name}</span>
              {spectator.id === myUserId && (
                <span className="text-yellow-400 text-xs">(شما)</span>
              )}
              {isCreator && spectator.id !== myUserId && onKickPlayer && (
                <button
                  onClick={() => onKickPlayer(spectator.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                  title="اخراج از روم"
                >
                  🚫
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* پنل انتخاب تیم و نقش برای تماشاگر فعلی */}
      {currentSpectator && (
        <div className="border-t border-gray-700 pt-4 mt-2">
          <p className="text-gray-300 mb-3 text-center">
            شما در لیست تماشاگران هستید. لطفاً تیم و نقش خود را انتخاب کنید:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* تیم قرمز */}
            <div className="border border-red-500 rounded p-3">
              <h3 className="text-red-500 font-bold mb-2 text-center">
                🔴 تیم قرمز
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onJoinGame("red", "spymaster")}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition"
                >
                  🎭 Spymaster
                </button>
                <button
                  onClick={() => onJoinGame("red", "operative")}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
                >
                  🎯 Operative
                </button>
              </div>
            </div>

            {/* تیم آبی */}
            <div className="border border-blue-500 rounded p-3">
              <h3 className="text-blue-500 font-bold mb-2 text-center">
                🔵 تیم آبی
              </h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onJoinGame("blue", "spymaster")}
                  className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded transition"
                >
                  🎭 Spymaster
                </button>
                <button
                  onClick={() => onJoinGame("blue", "operative")}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
                >
                  🎯 Operative
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
