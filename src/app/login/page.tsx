"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!res.ok) {
      setError("Invalid password");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="border p-6 rounded w-80 space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">
          Expense Tracker
        </h1>

        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border w-full px-3 py-2 rounded"
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button className="w-full bg-black text-white py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
