"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  // Prefill username from localStorage on first render
  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? localStorage.getItem("monopoly:username") : null;
      if (saved) setUsername(saved);
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const handlePlay = () => {
    if (username.trim() && roomId.trim()) {
      // Persist username for future visits
      try {
        localStorage.setItem("monopoly:username", username.trim());
      } catch (e) {
        // ignore storage errors
      }
      // Handle game start logic here
      console.log("Starting game with:", { username, roomId });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="arcade-container bg-purple-800/30 backdrop-blur-lg rounded-3xl border-4 border-purple-400 shadow-2xl shadow-purple-500/25 p-8 w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="arcade-title text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 mb-2">
            MONOPOLY
          </h1>
          <p className="text-purple-300 text-lg font-semibold tracking-wider">
            POLYBIT EDITION
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-6">
          <div className="input-group">
            <label htmlFor="username" className="block text-purple-200 font-bold mb-2 text-sm uppercase tracking-wider">
              Player Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              className="arcade-input w-full px-4 py-3 bg-purple-900/50 border-3 border-purple-400 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-purple-400/30 transition-all duration-300 font-semibold"
            />
          </div>

          <div className="input-group">
            <label htmlFor="roomId" className="block text-purple-200 font-bold mb-2 text-sm uppercase tracking-wider">
              Room ID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room code..."
              className="arcade-input w-full px-4 py-3 bg-purple-900/50 border-3 border-purple-400 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:border-pink-400 focus:ring-4 focus:ring-purple-400/30 transition-all duration-300 font-semibold"
            />
          </div>
        </div>

        {/* Play Button */}
        <div className="mt-8">
          <button
            onClick={handlePlay}
            disabled={!username.trim() || !roomId.trim()}
            className="play-button w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl uppercase tracking-wider rounded-xl border-3 border-purple-300 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            🎮 PLAY! 🎮
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-6 flex justify-center space-x-4 text-purple-300">
          <div className="animate-bounce">🎲</div>
          <div className="animate-bounce" style={{ animationDelay: "0.1s" }}>🏠</div>
          <div className="animate-bounce" style={{ animationDelay: "0.2s" }}>💰</div>
          <div className="animate-bounce" style={{ animationDelay: "0.3s" }}>🎩</div>
        </div>
      </div>
    </div>
  );
}
