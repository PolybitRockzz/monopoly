"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

type Game = {
  room_id: string;
  username: string[] | null;
  started?: boolean | null;
};

export default function RoomPage() {
  const params = useParams<{ roomid: string }>();
  const router = useRouter();
  const roomid = params?.roomid;

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyStart, setBusyStart] = useState(false);
  const username = useMemo(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("monopoly:username") || "";
    } catch {
      return "";
    }
  }, []);
  const isHost = Boolean(username && (game?.username?.[0] ?? null) === username);

  useEffect(() => {
    const load = async () => {
      if (!roomid) return;
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("games")
        .select("room_id, username, started")
        .eq("room_id", roomid)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setGame({ room_id: data.room_id, username: data.username, started: data.started });
      }
      setLoading(false);
    };
    load();
  }, [roomid]);

  // Join the room (add username to array) after initial load
  useEffect(() => {
    const join = async () => {
      if (!roomid || !username) return;
      try {
        const { data, error } = await supabase
          .from("games")
          .select("username")
          .eq("room_id", roomid)
          .single();
        if (error) return; // room might not exist
        const list: string[] = Array.isArray(data?.username) ? data.username : [];
        if (list.includes(username)) return; // already in room
        const next = [...list, username];
        const { data: upd, error: updErr } = await supabase
          .from("games")
          .update({ username: next })
          .eq("room_id", roomid)
          .select("room_id, username, started")
          .single();
        if (!updErr && upd) setGame({ room_id: upd.room_id, username: upd.username, started: upd.started });
      } catch {}
    };
    join();
  }, [roomid, username]);

  // Realtime updates for this room's players list
  useEffect(() => {
    if (!roomid) return;
    const channel = supabase
      .channel(`games-room-${roomid}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'games', filter: `room_id=eq.${roomid}` },
        (payload: any) => {
          const newRow = payload?.new;
          if (newRow) {
            setGame({ room_id: newRow.room_id, username: newRow.username ?? [], started: newRow.started ?? false });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomid]);

  const leaveRoom = async () => {
    if (!roomid || !username) {
      router.push("/");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("games")
        .select("username")
        .eq("room_id", roomid)
        .single();
      if (!error) {
        const list: string[] = Array.isArray(data?.username) ? data.username : [];
        const next = list.filter((u) => u !== username);
        const updates: any = { username: next };
        if (next.length === 0) updates.started = false;
        await supabase
          .from("games")
          .update(updates)
          .eq("room_id", roomid);
      }
    } catch {}
    router.push("/");
  };

  const startGame = async () => {
    if (!roomid || !isHost) return;
    setBusyStart(true);
    try {
      const { data, error } = await supabase
        .from('games')
        .update({ started: true })
        .eq('room_id', roomid)
        .select('room_id, username, started')
        .single();
      if (!error && data) {
        setGame({ room_id: data.room_id, username: data.username, started: data.started });
      }
    } catch {}
    setBusyStart(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="arcade-container bg-purple-800/30 backdrop-blur-lg rounded-3xl border-4 border-purple-400 shadow-2xl shadow-purple-500/25 p-8 w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="arcade-title text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
            Room {roomid}
          </h1>
          <p className="text-purple-300 mt-2">Players in this room</p>
        </div>

        {loading && <p className="text-purple-200 text-center">Loading...</p>}
        {error && <p className="text-pink-300 text-center">{error}</p>}

        {!loading && !error && (
          <ul className="space-y-2">
            {(game?.username ?? []).length === 0 && (
              <li className="text-purple-200 text-center">No players yet.</li>
            )}
            {(game?.username ?? []).map((u) => (
              <li
                key={u}
                className="w-full px-4 py-3 bg-purple-900/50 border-3 border-purple-400 rounded-xl text-white flex items-center justify-between"
              >
                <span className="font-semibold">{u}</span>
              </li>
            ))}
          </ul>
        )}

        {isHost && (
          <div className="mt-4">
            <button
              onClick={startGame}
              disabled={busyStart || (game?.username?.length ?? 0) <= 1 || game?.started === true}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold uppercase tracking-wider rounded-xl border-3 border-emerald-300 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/50 disabled:opacity-60"
            >
              {game?.started ? 'Game Started' : busyStart ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={leaveRoom}
            disabled={busy}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold uppercase tracking-wider rounded-xl border-3 border-purple-300 shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 disabled:opacity-60"
          >
            {busy ? 'Leaving...' : 'Leave Room'}
          </button>
        </div>
      </div>
    </div>
  );
}
