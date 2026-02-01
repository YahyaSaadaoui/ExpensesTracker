"use client";

import { useState } from "react";
import SettingsModal from "./SettingsModal";

export default function Navbar() {
  const [openSettings, setOpenSettings] = useState(false);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      <header className="h-14 flex items-center justify-between px-6 border-b bg-white">
        <span className="font-semibold text-gray-900">
          Expense Tracker
        </span>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setOpenSettings(true)}
            className="text-gray-600 hover:text-gray-900"
            title="Settings"
          >
            ⚙️
          </button>

          <button
            onClick={logout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      {openSettings && (
        <SettingsModal onClose={() => setOpenSettings(false)} />
      )}
    </>
  );
}
