// frontend/app/interfaces/game.ts

export interface Player {
  id: string;
  name: string;
  team: "red" | "blue" | null;
  role: "spymaster" | "operative" | null;
}

export interface Spectator {
  id: string;
  name: string;
}

export interface RoomUpdateData {
  code: string;
  creatorId: string;
  players: Player[];
  playerCount: number;
  gameStatus: "waiting" | "active" | "finished";
}

export interface GameWord {
  word: string;
  color: "red" | "blue" | "neutral" | "assassin";
  isRevealed: boolean;
}

export interface GameState {
  words: GameWord[];
  turn: "red" | "blue";
  redTeam: {
    spymaster: string | null;
    operatives: string[];
    remainingWords: number;
  };
  blueTeam: {
    spymaster: string | null;
    operatives: string[];
    remainingWords: number;
  };
  currentClue?: {
    clue: string;
    number: number;
    giverId: string;
  };
  remainingOperatives: number;
  winner: "red" | "blue" | null;
}
