"use client";

import SettingsCard from "./SettingsCard";

export default function SettingsModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Settings</h2>
          <button onClick={onClose}>✕</button>
        </div>

        <SettingsCard onUpdated={onClose} />
      </div>
    </div>
  );
}
