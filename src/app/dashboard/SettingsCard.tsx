"use client";

import { useEffect, useState } from "react";

type Settings = {
  salary: number;
  monthStartDay: number;
};

export default function SettingsCard({
  onUpdated,
}: {
  onUpdated?: () => void;
}) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/settings");
      if (!res.ok) return;
      setSettings(await res.json());
    })();
  }, []);

  async function save() {
    if (!settings) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Failed to save settings");
      return;
    }

    onUpdated?.();
  }

  if (!settings) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Settings
      </h2>

      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Monthly salary (DH)
          </label>
          <input
            type="number"
            value={settings.salary}
            onChange={(e) =>
              setSettings({
                ...settings,
                salary: Number(e.target.value),
              })
            }
            className="w-full rounded-lg border text-black border-gray-300 px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Month starts on day
          </label>
          <input
            type="number"
            min={1}
            max={31}
            value={settings.monthStartDay}
            onChange={(e) =>
              setSettings({
                ...settings,
                monthStartDay: Number(e.target.value),
              })
            }
            className="w-full rounded-lg border text-black border-gray-300 px-3 py-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: 28 → month runs from 28 to 27
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={loading}
          className="
            px-4 py-2
            rounded-lg
            bg-gray-900 text-white
            hover:bg-gray-800
            transition
            disabled:opacity-50
          "
        >
          {loading ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
