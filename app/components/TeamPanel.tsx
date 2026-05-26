// frontend/app/components/TeamPanel.tsx
import type { Player } from "../interfaces/game";

interface TeamPanelProps {
  team: "red" | "blue";
  players: Player[];
  myUserId: string;
  isCreator: boolean;
  gameStatus: "waiting" | "active" | "finished";
  onSelectTeam?: (userId: string, team: "red" | "blue") => void;
  onSelectRole?: (
    team: "red" | "blue",
    role: "spymaster" | "operative",
  ) => void;
  onSwitchTeam?: () => void;
  onSwitchRole?: () => void;
  onKickPlayer?: (userId: string) => void;
  // onTransferOwnership?: (userId: string) => void;
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
  // onTransferOwnership,
}: TeamPanelProps) {
  const teamPlayers = players.filter((p) => p.team === team);
  const spymaster = teamPlayers.find((p) => p.role === "spymaster");
  const operatives = teamPlayers.filter((p) => p.role === "operative");
  const spectators = players.filter((p) => p.team === null);

  const teamColor = team === "red" ? "red" : "blue";
  const bgColor = team === "red" ? "bg-red-900/30" : "bg-blue-900/30";
  const borderColor = team === "red" ? "border-red-500" : "border-blue-500";

  const currentPlayer = players.find((p) => p.id === myUserId);
  const isInThisTeam = currentPlayer?.team === team;
  const canSelectRole = gameStatus === "waiting" && isInThisTeam;

  // بررسی اینکه آیا این تیم Spymaster دارد
  const hasSpymaster = !!spymaster;
  const hasoperatives = operatives.length > 0;

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg p-2 xs:p-3 sm:p-4 flex-1 min-w-[120px] xs:min-w-[150px] sm:min-w-[200px]`}
    >
      <div className="flex justify-between items-center mb-2 sm:mb-3 flex-wrap gap-1">
        <h2
          className={`text-base sm:text-lg md:text-xl font-bold ${team === "red" ? "text-red-500" : "text-blue-500"}`}
        >
          {team === "red" ? "🔴 تیم قرمز" : "🔵 تیم آبی"}
        </h2>
        {gameStatus === "waiting" &&
          !isInThisTeam &&
          currentPlayer?.team === null &&
          onSelectTeam && (
            <button
              onClick={() => onSelectTeam(myUserId, team)}
              className="text-[10px] xs:text-xs bg-green-600 hover:bg-green-700 px-1 xs:px-2 py-0.5 rounded"
            >
              ✚ این تیم
            </button>
          )}
        {gameStatus === "waiting" && isInThisTeam && onSwitchTeam && (
          <button
            onClick={onSwitchTeam}
            className="text-[10px] xs:text-xs bg-yellow-600 hover:bg-yellow-700 px-1 xs:px-2 py-0.5 rounded"
          >
            🔄 تغییر تیم
          </button>
        )}
      </div>

      {/* Spymaster Section */}
      <div className="mb-2 sm:mb-3">
        <div className="text-xs text-gray-400 mb-0.5 sm:mb-1">
          🎭 Spymaster :
        </div>
        {spymaster ? (
          <div className="bg-gray-800 rounded p-1 xs:p-2 flex justify-between items-center text-xs sm:text-sm">
            <span className="text-lime-400">
              {spymaster.name}
              {spymaster.id === myUserId && " (You)"}
              {!hasoperatives && gameStatus === "waiting" && " ⚠️ بدون حدس‌زن"}
            </span>
            {gameStatus === "waiting" &&
              isInThisTeam &&
              currentPlayer?.role === "spymaster" &&
              onSwitchRole && (
                <button
                  onClick={onSwitchRole}
                  className="text-[10px] xs:text-xs bg-yellow-600 hover:bg-yellow-700 px-1 xs:px-2 py-0.5 rounded"
                >
                  تبدیل به Operative
                </button>
              )}
            {isCreator && spymaster.id !== myUserId && (
              <button
                onClick={() => onKickPlayer?.(spymaster.id)}
                className="text-red-400 hover:text-red-300 text-xs"
                title="اخراج"
              >
                🚫
              </button>
            )}
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded p-1 xs:p-2 text-gray-500 text-xs sm:text-sm flex justify-between items-center">
            <span className="text-lime-400">بدون Spymaster</span>
            {canSelectRole && !hasSpymaster && onSelectRole && (
              <button
                onClick={() => onSelectRole(team, "spymaster")}
                className="text-[10px] xs:text-xs bg-purple-600 hover:bg-purple-700 px-1 xs:px-2 py-0.5 rounded"
              >
                تبدیل به Spymaster
              </button>
            )}
          </div>
        )}
      </div>

      {/* operatives Section */}
      <div>
        <div className="text-xs text-gray-400 mb-0.5 sm:mb-1">
          🎯 Operative :
        </div>
        <div className="space-y-0.5 sm:space-y-1">
          {operatives.length === 0 ? (
            <div className="text-gray-500 text-xs flex justify-between items-center">
              <span className="text-lime-400">بدون Operative</span>
              {canSelectRole && !hasSpymaster && onSelectRole && (
                <button
                  onClick={() => onSelectRole(team, "operative")}
                  className="text-[10px] xs:text-xs bg-blue-600 hover:bg-blue-700 px-1 xs:px-2 py-0.5 rounded"
                >
                  تبدیل به Operative
                </button>
              )}
            </div>
          ) : (
            operatives.map((operative) => (
              <div
                key={operative.id}
                className="bg-gray-800 rounded p-1 px-1 xs:px-2 flex justify-between items-center text-xs sm:text-sm"
              >
                <span className="text-lime-400 truncate max-w-[100px] xs:max-w-[150px]">
                  {operative.name} {operative.id === myUserId && "(You)"}
                </span>
                {/* <div className="flex gap-1"> */}
                {isCreator && operative.id !== myUserId && (
                  <button
                    onClick={() => onKickPlayer?.(operative.id)}
                    className="text-red-400 hover:text-black-300 text-xs"
                    title="اخراج"
                  >
                    🚫
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Spectators waiting for team assignment */}
      {gameStatus === "waiting" && spectators.length > 0 && (
        <div className="mt-2 sm:mt-3 pt-1 sm:pt-2 border-t border-gray-700">
          <div className="text-[10px] text-gray-500 mb-0.5">
            👁️ در انتظار انتخاب تیم:
          </div>
          {spectators.map((spectator) => (
            <div
              key={spectator.id}
              className="text-[10px] text-gray-400 flex justify-between items-center"
            >
              <span className="truncate">{spectator.name}</span>
              {isCreator && spectator.id !== myUserId && onKickPlayer && (
                <button
                  onClick={() => onKickPlayer(spectator.id)}
                  className="text-red-400 hover:text-red-300"
                  title="اخراج"
                >
                  🚫
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
