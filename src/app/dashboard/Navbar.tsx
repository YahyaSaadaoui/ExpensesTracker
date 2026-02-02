"use client";

import { useState } from "react";
import SettingsModal from "./SettingsModal";

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a7.9 7.9 0 0 0 .1-2l2-1.5-2-3.5-2.4 1a8.2 8.2 0 0 0-1.7-1l-.4-2.6H11l-.4 2.6a8.2 8.2 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7.9 7.9 0 0 0 .1 2l-2 1.5 2 3.5 2.4-1a8.2 8.2 0 0 0 1.7 1l.4 2.6h4l.4-2.6a8.2 8.2 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5Z"
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
      <header className="h-14 flex items-center justify-between px-6 border-b border-white/10 bg-black/40">
       <span className="flex items-center gap-2 font-semibold text-white/90 whitespace-nowrap">
        <img
          src="/ExpensesTrackerLogo.png"
          alt="Expense Tracker logo"
          className="h-6 w-6 object-contain"
        />
        Expense Tracker
      </span>


        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenSettings(true)}
            className="btn-apple"
            title="Settings"
          >
            <SettingsIcon />
          </button>

          <button onClick={logout} className="btn-apple">
            Logout
          </button>
        </div>
      </header>

      {openSettings && <SettingsModal onClose={() => setOpenSettings(false)} />}
    </>
  );
}
