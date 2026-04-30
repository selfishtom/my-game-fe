// frontend/app/components/ClueForm.tsx
import { useState } from "react";

interface ClueFormProps {
  onGiveClue: (clue: string, number: number) => void;
  disabled?: boolean;
}

export default function ClueForm({
  onGiveClue,
  disabled = false,
}: ClueFormProps) {
  const [clue, setClue] = useState("");
  const [number, setNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clue.trim() || !number) return;

    const num = parseInt(number);
    if (isNaN(num) || num < 1 || num > 9) return;

    onGiveClue(clue.trim(), num);
    setClue("");
    setNumber("");
  };

  return (
    <div className="mt-4 bg-gray-800 rounded-lg p-4">
      <h3 className="text-white font-bold mb-3">🗣️ دادن رمز:</h3>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={clue}
          onChange={(e) => setClue(e.target.value)}
          placeholder="کلمه رمز..."
          disabled={disabled}
          className="flex-1 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        />
        <input
          type="number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="عدد (1-9)"
          min={1}
          max={9}
          disabled={disabled}
          className="w-full sm:w-24 bg-gray-700 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !clue.trim() || !number}
          className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition"
        >
          ارسال
        </button>
      </form>
    </div>
  );
}
