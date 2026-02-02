"use client";

import { useState } from "react";
import SettingsModal from "./SettingsModal";

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a7.9 7.9 0 0 0 .1-1l2-1.2-2-3.4-2.3.7a7.1 7.1 0 0 0-1.7-1L15.2 5h-4L9.5 8.1a7.1 7.1 0 0 0-1.7 1l-2.3-.7-2 3.4 2 1.2a7.9 7.9 0 0 0 .1 1 7.9 7.9 0 0 0-.1 1l-2 1.2 2 3.4 2.3-.7a7.1 7.1 0 0 0 1.7 1L11.2 23h4l1.7-3.1a7.1 7.1 0 0 0 1.7-1l2.3.7 2-3.4-2-1.2a7.9 7.9 0 0 0 .1-1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const [openSettings, setOpenSettings] = useState(false);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      <header className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-zinc-950">
        <span className="font-semibold text-white tracking-wide"><img src="./ExpenseTrackerLogo.png" alt="Expense Tracker Logo"  />Expense Tracker</span>
        

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenSettings(true)}
            className="rounded-xl px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 transition"
            title="Settings"
          >
            <GearIcon />
          </button>

          <button
            onClick={logout}
            className="rounded-xl px-4 py-2 text-sm font-medium bg-white text-black hover:bg-white/90 transition"
          >
            Logout
          </button>
        </div>
      </header>

      {openSettings && <SettingsModal onClose={() => setOpenSettings(false)} />}
    </>
  );
}
