// frontend/app/routes/room/types.ts
import type { Player, Spectator } from "../../interfaces/game";

export interface RoomPageProps {
  code: string;
}

export interface RoomData {
  players: Player[];
  spectators: Spectator[];
  myUserId: string;
  myPlayerName: string;
  isCreator: boolean;
  gameStarted: boolean;
  gameStatus: "waiting" | "active" | "finished";
  isLoading: boolean;
}
