// frontend/app/components/EndTurnButton.tsx
interface EndTurnButtonProps {
  onEndTurn: () => void;
  disabled?: boolean;
}

export default function EndTurnButton({
  onEndTurn,
  disabled = false,
}: EndTurnButtonProps) {
  return (
    <div className="mt-4 text-center">
      <button
        onClick={onEndTurn}
        disabled={disabled}
        className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 text-white px-6 py-2 rounded transition"
      >
        پایان نوبت →
      </button>
    </div>
  );
}
