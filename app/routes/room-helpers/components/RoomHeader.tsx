// frontend/app/routes/room/components/RoomHeader.tsx
interface RoomHeaderProps {
  playerName: string;
  roomCode: string;
  isCreator?: boolean;
  onChangeCode?: () => void;
}

export default function RoomHeader({
  playerName,
  roomCode,
  isCreator,
  onChangeCode,
}: RoomHeaderProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4 flex justify-between items-center flex-wrap">
      <h1 className="text-xl md:text-2xl text-white">🎮 Codenames</h1>
      <div className="flex gap-4 items-center">
        <span className="text-gray-300">👤 {playerName}</span>
        {isCreator && onChangeCode && (
          <button
            onClick={onChangeCode}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
          >
            🔄 Change Code
          </button>
        )}
        <span className="text-blue-400">کد روم: {roomCode}</span>
      </div>
    </div>
  );
}
