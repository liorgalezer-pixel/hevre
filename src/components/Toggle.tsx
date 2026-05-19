"use client";

type Props = { value: boolean; onChange: () => void };

export default function Toggle({ value, onChange }: Props) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-7 rounded-full transition-colors shrink-0 relative ${value ? "bg-blue-600" : "bg-gray-200"}`}
    >
      <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}
