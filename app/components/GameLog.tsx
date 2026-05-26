// frontend/app/components/GameLog.tsx
import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export interface GameLogEntry {
  id: string;
  timestamp: number;
  type:
    | "info"
    | "success"
    | "error"
    | "warning"
    | "turn"
    | "clue"
    | "guess"
    | "winner";
  message: string;
}

interface GameLogProps {
  socket: Socket | null;
  roomCode: string;
}

export default function GameLog({ socket, roomCode }: GameLogProps) {
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    const handleGameLog = (data: { log: GameLogEntry }) => {
      console.log("📝 New log received:", data.log);
      setLogs((prev) => [...prev, data.log]);
    };

    const handleGameLogs = (data: { logs: GameLogEntry[] }) => {
      console.log("📝 Initial logs received:", data.logs.length);
      setLogs(data.logs);
    };

    socket.on("game-log", handleGameLog);
    socket.on("game-logs", handleGameLogs);

    return () => {
      socket.off("game-log", handleGameLog);
      socket.off("game-logs", handleGameLogs);
    };
  }, [socket]);

  // اسکرول خودکار به انتها هنگام اضافه شدن لاگ جدید
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (type: GameLogEntry["type"]) => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "turn":
        return "🔄";
      case "clue":
        return "💡";
      case "guess":
        return "🎯";
      case "winner":
        return "🏆";
      default:
        return "📝";
    }
  };

  const getLogColor = (type: GameLogEntry["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "turn":
        return "text-blue-400";
      case "clue":
        return "text-purple-400";
      case "guess":
        return "text-cyan-400";
      case "winner":
        return "text-yellow-500";
      default:
        return "text-gray-300";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 h-[calc(100vh-2rem)] flex flex-col">
      <h3 className="text-gray-400 font-bold mb-2 text-sm border-b border-gray-700 pb-2">
        رویداد ها
      </h3>
      <div ref={logsContainerRef} className="flex-1 overflow-y-auto space-y-1">
        {logs.length === 0 ? (
          <p className="text-gray-500 text-center text-sm py-4">
            هنوز رویدادی ثبت نشده است
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`text-xs py-1 border-b border-gray-700 last:border-0 ${getLogColor(log.type)}`}
            >
              <span className="text-gray-500 text-[10px] ml-2">
                {formatTime(log.timestamp)}
              </span>
              <span className="ml-1">{getLogIcon(log.type)}</span>
              <span className="break-words">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
