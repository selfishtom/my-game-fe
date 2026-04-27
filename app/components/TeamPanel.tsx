// frontend/app/components/TeamPanel.tsx
import type { Player } from "../interfaces/game";

interface TeamPanelProps {
  team: "red" | "blue";
  players: Player[];
  myUserId: string;
  isCreator: boolean;
  gameStatus: "waiting" | "active" | "finished";
  onSelectTeam?: (userId: string, team: "red" | "blue") => void;
  onSelectRole?: (team: "red" | "blue", role: "spymaster" | "guesser") => void;
  onSwitchTeam?: () => void;
  onSwitchRole?: () => void;
  onKickPlayer?: (userId: string) => void;
  onTransferOwnership?: (userId: string) => void;
}

export default function TeamPanel({
  team,
  players,
  myUserId,
  isCreator,
  gameStatus,
  onSelectTeam,
  onSelectRole,
  onSwitchTeam,
  onSwitchRole,
  onKickPlayer,
  onTransferOwnership,
}: TeamPanelProps) {
  const teamPlayers = players.filter((p) => p.team === team);
  const spymaster = teamPlayers.find((p) => p.role === "spymaster");
  const guessers = teamPlayers.filter((p) => p.role === "guesser");
  const spectators = players.filter((p) => p.team === null);

  const teamColor = team === "red" ? "red" : "blue";
  const bgColor = team === "red" ? "bg-red-900/30" : "bg-blue-900/30";
  const borderColor = team === "red" ? "border-red-500" : "border-blue-500";

  const currentPlayer = players.find((p) => p.id === myUserId);
  const isInThisTeam = currentPlayer?.team === team;
  const canSelectRole = gameStatus === "waiting" && isInThisTeam;

  // بررسی اینکه آیا این تیم Spymaster دارد
  const hasSpymaster = !!spymaster;
  const hasGuessers = guessers.length > 0;

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg p-4 flex-1 min-w-[250px]`}
    >
      <div className="flex justify-between items-center mb-3">
        <h2
          className={`text-xl font-bold ${team === "red" ? "text-red-500" : "text-blue-500"}`}
        >
          {team === "red" ? "🔴 تیم قرمز" : "🔵 تیم آبی"}
        </h2>
        {gameStatus === "waiting" &&
          !isInThisTeam &&
          currentPlayer?.team === null &&
          onSelectTeam && (
            <button
              onClick={() => onSelectTeam(myUserId, team)}
              className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
            >
              ✚ این تیم
            </button>
          )}
        {gameStatus === "waiting" && isInThisTeam && onSwitchTeam && (
          <button
            onClick={onSwitchTeam}
            className="text-xs bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded"
          >
            🔄 تغییر تیم
          </button>
        )}
      </div>

      {/* Spymaster Section */}
      <div className="mb-3">
        <div className="text-sm text-gray-400 mb-1">
          🎭 Spymaster (رمز‌دهنده):
        </div>
        {spymaster ? (
          <div className="bg-black-800 rounded p-2 flex justify-between items-center">
            <span>
              {spymaster.name}
              {spymaster.id === myUserId && " (You)"}
              {!hasGuessers && gameStatus === "waiting" && " ⚠️ بدون حدس‌زن"}
            </span>
            {gameStatus === "waiting" &&
              isInThisTeam &&
              currentPlayer?.role === "spymaster" &&
              onSwitchRole && (
                <button
                  onClick={onSwitchRole}
                  className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
                >
                  تبدیل به Guesser
                </button>
              )}
            {isCreator && spymaster.id !== myUserId && (
              <button
                onClick={() => onKickPlayer?.(spymaster.id)}
                className="text-red-400 hover:text-red-300 text-sm px-2"
                title="اخراج"
              >
                🚫
              </button>
            )}
            {isCreator && spymaster.id !== myUserId && (
              <button
                onClick={() => onTransferOwnership?.(spymaster.id)}
                className="text-purple-400 hover:text-purple-300 text-xs px-1"
                title="انتقال مدیریت"
              >
                👑 انتقال مدیریت
              </button>
            )}
          </div>
        ) : (
          <div className="bg-black-800/50 rounded p-2 text-black-500 text-sm flex justify-between items-center">
            <span>بدون Spymaster</span>
            {canSelectRole && !hasSpymaster && onSelectRole && (
              <button
                onClick={() => onSelectRole(team, "spymaster")}
                className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
              >
                تبدیل به Spymaster
              </button>
            )}
          </div>
        )}
      </div>

      {/* Guessers Section */}
      <div>
        <div className="text-sm text-gray-400 mb-1">
          🎯 Guessers (حدس‌زننده):
        </div>
        <div className="space-y-1">
          {guessers.length === 0 ? (
            <div className="text-black-500 text-sm flex justify-between items-center">
              <span>بدون حدس‌زن</span>
              {canSelectRole && !hasSpymaster && onSelectRole && (
                <button
                  onClick={() => onSelectRole(team, "guesser")}
                  className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
                >
                  تبدیل به Guesser
                </button>
              )}
            </div>
          ) : (
            guessers.map((guesser) => (
              <div
                key={guesser.id}
                className="bg-gray-800 rounded p-1 px-2 flex justify-between items-center text-sm"
              >
                <span>
                  {guesser.name} {guesser.id === myUserId && "(You)"}
                </span>
                <div className="flex gap-1">
                  {/* {gameStatus === "waiting" &&
                    isInThisTeam &&
                    currentPlayer?.role === "guesser" &&
                    currentPlayer.id === guesser.id &&
                    onSwitchRole && (
                      <button
                        onClick={onSwitchRole}
                        className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-0.5 rounded"
                      >
                        تبدیل به Spymaster
                      </button>
                    )} */}
                  {isCreator && guesser.id !== myUserId && (
                    <button
                      onClick={() => onKickPlayer?.(guesser.id)}
                      className="text-red-400 hover:text-black-300 text-xs"
                      title="اخراج"
                    >
                      🚫
                    </button>
                  )}

                  {isCreator && guesser.id !== myUserId && (
                    <button
                      onClick={() => onTransferOwnership?.(guesser.id)}
                      className="text-purple-400 hover:text-purple-300 text-xs px-1"
                      title="انتقال مدیریت"
                    >
                      👑 انتقال مدیریت
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Team Status Warning */}
      {gameStatus === "waiting" && (
        <div className="mt-3 pt-2 border-t border-gray-700 text-xs">
          {!spymaster && (
            <div className="text-yellow-500">
              ⚠️ این تیم نیاز به Spymaster دارد
            </div>
          )}
          {guessers.length === 0 && (
            <div className="text-yellow-500">
              ⚠️ این تیم نیاز به حدس‌زن دارد
            </div>
          )}
        </div>
      )}

      {/* Spectators waiting for team assignment */}
      {gameStatus === "waiting" && spectators.length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-700">
          <div className="text-xs text-gray-500 mb-1">
            👁️ در انتظار انتخاب تیم:
          </div>
          {spectators.map((spectator) => (
            <div
              key={spectator.id}
              className="text-xs text-gray-400 flex justify-between items-center mt-1"
            >
              <span>{spectator.name}</span>
              <div className="flex gap-1">
                {onSelectTeam && (
                  <>
                    <button
                      onClick={() => onSelectTeam(spectator.id, "red")}
                      className="text-red-400 hover:text-red-300 text-xs px-1"
                    >
                      🔴 قرمز
                    </button>
                    <button
                      onClick={() => onSelectTeam(spectator.id, "blue")}
                      className="text-blue-400 hover:text-blue-300 text-xs px-1"
                    >
                      🔵 آبی
                    </button>
                  </>
                )}
                {isCreator && spectator.id !== myUserId && onKickPlayer && (
                  <button
                    onClick={() => onKickPlayer(spectator.id)}
                    className="text-red-400 hover:text-red-300 text-xs"
                    title="اخراج"
                  >
                    🚫
                  </button>
                )}

                {isCreator && spectator.id !== myUserId && (
                  <button
                    onClick={() => onTransferOwnership?.(spectator.id)}
                    className="text-purple-400 hover:text-purple-300 text-xs px-1"
                    title="انتقال مدیریت"
                  >
                    👑 انتقال مدیریت
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
