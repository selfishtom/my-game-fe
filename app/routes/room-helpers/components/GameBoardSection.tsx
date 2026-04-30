// frontend/app/routes/room/components/GameBoardSection.tsx
import Board from "../../../components/Board";
import TeamPanel from "../../../components/TeamPanel";
import RoomHeader from "./RoomHeader";
import ClueForm from "../../../components/ClueForm";
import EndTurnButton from "../../../components/EndTurnButton";
import type { Player, Spectator } from "../../../interfaces/game";
import type { GameState } from "../../../interfaces/game";

interface GameBoardSectionProps {
  roomCode: string;
  playerName: string;
  players: Player[];
  spectators: Spectator[];
  myUserId: string;
  isCreator: boolean;
  gameState: GameState;
  onMakeGuess: (wordIndex: number) => void;
  onGiveClue?: (clue: string, number: number) => void;
  onEndTurn?: () => void;
  onKickPlayer?: (userId: string) => void;
  onTransferOwnership?: (userId: string) => void;
}

export default function GameBoardSection({
  roomCode,
  playerName,
  players,
  spectators,
  myUserId,
  isCreator,
  gameState,
  onMakeGuess,
  onGiveClue,
  onEndTurn,
  onKickPlayer,
  onTransferOwnership,
}: GameBoardSectionProps) {
  const currentPlayer = players.find((p) => p.id === myUserId);
  const myTeam = currentPlayer?.team || null;
  const myRole = currentPlayer?.role || null;
  const isMyTurn = myTeam === gameState.turn;

  const hasClueBeenGiven =
    !!gameState.currentClue && "clue" in gameState.currentClue;

  const canGiveClue = myRole === "spymaster" && isMyTurn && !hasClueBeenGiven;
  const canGuess = myRole === "operative" && isMyTurn && hasClueBeenGiven;

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <RoomHeader
          playerName={playerName}
          roomCode={roomCode}
          isCreator={isCreator}
        />

        {/* Spectators List */}
        {spectators.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-3 mb-4">
            <h2 className="text-gray-400 font-bold mb-1 text-sm">
              👁️ تماشاگران ({spectators.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {spectators.map((s) => (
                <div
                  key={s.id}
                  className="bg-gray-700 px-2 py-0.5 rounded-full text-xs flex items-center gap-1"
                >
                  {s.name}
                  {isCreator && s.id !== myUserId && onKickPlayer && (
                    <button
                      onClick={() => onKickPlayer(s.id)}
                      className="text-red-400 hover:text-red-300 ml-1"
                      title="اخراج"
                    >
                      🚫
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Clue Display */}
        {hasClueBeenGiven && gameState.currentClue && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4 text-center">
            <p className="text-gray-400 text-sm mb-1">رمز داده شده:</p>
            <p className="text-3xl font-bold text-yellow-400">
              {gameState.currentClue.clue}
            </p>
            <p className="text-gray-300 mt-1">
              تعداد حدس‌ها:{" "}
              <span className="text-green-400 font-bold">
                {gameState.currentClue.number}
              </span>
            </p>
            {gameState.remainingOperatives > 0 && (
              <p className="text-gray-400 text-sm mt-2">
                حدس‌های باقی‌مانده: {gameState.remainingOperatives}
              </p>
            )}
          </div>
        )}

        {/* Main Game Layout - 3 columns */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: Blue Team Panel */}
          <div className="md:w-64 order-1">
            <TeamPanel
              team="blue"
              players={players}
              myUserId={myUserId}
              isCreator={isCreator}
              gameStatus="active"
              onKickPlayer={onKickPlayer}
              onTransferOwnership={onTransferOwnership}
            />
          </div>

          {/* Center: Game Board */}
          <div className="flex-1 order-2">
            <Board
              words={gameState.words}
              currentTurn={gameState.turn}
              myTeam={myTeam}
              myRole={myRole}
              onGuess={onMakeGuess}
              disabled={!canGuess}
              remainingOperatives={gameState.remainingOperatives}
            />

            {/* Clue Form for Spymaster */}
            {canGiveClue && onGiveClue && <ClueForm onGiveClue={onGiveClue} />}

            {/* End Turn Button for Operative */}
            {canGuess && onEndTurn && <EndTurnButton onEndTurn={onEndTurn} />}
          </div>

          {/* Right: Red Team Panel */}
          <div className="md:w-64 order-3">
            <TeamPanel
              team="red"
              players={players}
              myUserId={myUserId}
              isCreator={isCreator}
              gameStatus="active"
              onKickPlayer={onKickPlayer}
              onTransferOwnership={onTransferOwnership}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
