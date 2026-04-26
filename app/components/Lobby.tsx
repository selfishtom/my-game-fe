// frontend/app/components/Lobby.tsx
interface Player {
  id: string;
  name: string;
  isReady: boolean;
}

interface LobbyProps {
  roomCode: string;
  players: Player[];
  myUserId: string;
  myPlayerName: string;
  isConnected: boolean;
  message: string;
  onToggleReady: () => void;
  onStartGame: () => void; // Changed from optional to required
  isCreator: boolean;
  readyCount: number;
}

export default function Lobby({
  roomCode,
  players,
  myUserId,
  myPlayerName,
  isConnected,
  message,
  onToggleReady,
  onStartGame,
  isCreator,
  readyCount,
}: LobbyProps) {
  const currentPlayer = players.find((p) => p.id === myUserId);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center">
          🎮 Codenames Room
        </h1>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <p className="text-center text-xl">
            Room Code:{" "}
            <span className="font-mono text-blue-400">{roomCode}</span>
          </p>
          <p className="text-center mt-2">
            Status: {isConnected ? "✅ Connected" : "❌ Connecting..."}
          </p>
          <p className="text-center text-sm text-gray-400 mt-2">{message}</p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-3">
            Players ({players.length})
          </h2>
          {players.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              Waiting for players to join...
            </p>
          ) : (
            <ul className="space-y-2">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="bg-gray-700 p-2 rounded flex justify-between items-center"
                >
                  <span>
                    {player.name}
                    {player.id === myUserId && " (You)"}
                    {isCreator && player.id === myUserId && " 👑"}
                  </span>
                  {player.isReady && (
                    <span className="text-green-500 text-sm">✅ Ready</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onToggleReady}
            className="flex-1 bg-green-600 hover:bg-green-700 py-2 rounded transition"
          >
            {currentPlayer?.isReady ? "❌ Not Ready" : "✅ Ready"}
          </button>

          {isCreator && readyCount >= 2 && (
            <button
              onClick={onStartGame}
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded transition"
            >
              🚀 Start Game
            </button>
          )}
        </div>

        {isCreator && readyCount < 2 && players.length >= 2 && (
          <p className="text-yellow-500 text-center mt-4 text-sm">
            Need at least 2 ready players to start game
          </p>
        )}
      </div>
    </div>
  );
}
