"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Public STUN only — enough for most networks. Audio is peer-to-peer (DTLS-SRTP
// encrypted); the backend only relays the tiny SDP/ICE handshake. A small slice
// of strict NATs would need a TURN relay, which can be added here later.
const ICE: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
};

const POLL_MS = 900;
const HEARTBEAT_MS = 3000;
const SPEAK_MS = 200;
const SPEAK_THRESHOLD = 0.045;

export interface CallUiParticipant {
  userId: string;
  emoji: string;
  isMe: boolean;
  connected: boolean;
  speaking: boolean;
}

interface PeerRec {
  pc: RTCPeerConnection;
  stream: MediaStream;
  audio: HTMLAudioElement | null;
  emoji: string;
  pending: RTCIceCandidate[];
  connected: boolean;
}

interface Roster {
  userId: string;
  emoji: string;
  lastSeen: number;
}

/**
 * A room-wide voice call as a WebRTC mesh: one peer connection to every other
 * participant. Presence is a heartbeat; signaling is delivered over the room's
 * call endpoint. Deterministic offerer (smaller userId) avoids glare.
 */
export function useGroupCall(roomId: string, userId: string, emoji: string) {
  const [inCall, setInCall] = useState(false);
  const [joining, setJoining] = useState(false);
  const [muted, setMuted] = useState(false);
  const [participants, setParticipants] = useState<CallUiParticipant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, PeerRec>>(new Map());
  const rosterRef = useRef<Map<string, Roster>>(new Map());
  const analysersRef = useRef<Map<string, { analyser: AnalyserNode; data: Uint8Array }>>(new Map());
  const speakingRef = useRef<Set<string>>(new Set());
  const acRef = useRef<AudioContext | null>(null);
  const inCallRef = useRef(false);
  const mutedRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hbRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const supported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof RTCPeerConnection !== "undefined";

  const syncParticipants = useCallback(() => {
    const list: CallUiParticipant[] = [...rosterRef.current.values()].map((p) => ({
      userId: p.userId,
      emoji: p.emoji,
      isMe: p.userId === userId,
      connected: p.userId === userId ? true : peersRef.current.get(p.userId)?.connected ?? false,
      speaking: speakingRef.current.has(p.userId),
    }));
    setParticipants(list);
  }, [userId]);

  const attachAnalyser = useCallback((id: string, stream: MediaStream) => {
    try {
      let ac = acRef.current;
      if (!ac) {
        const Ctx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) return;
        ac = new Ctx();
        acRef.current = ac;
      }
      if (ac.state === "suspended") ac.resume().catch(() => {});
      const src = ac.createMediaStreamSource(stream);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser); // not connected to destination — analysis only, no echo
      analysersRef.current.set(id, { analyser, data: new Uint8Array(analyser.fftSize) });
    } catch {
      /* speaking glow is best-effort */
    }
  }, []);

  const sendSignal = useCallback(
    (to: string, kind: "offer" | "answer" | "candidate", data: string) => {
      fetch(`/api/room/${roomId}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signal", from: userId, to, kind, data }),
      }).catch(() => {});
    },
    [roomId, userId],
  );

  const establishPeer = useCallback(
    (peerId: string, peerEmoji: string): PeerRec => {
      const existing = peersRef.current.get(peerId);
      if (existing) {
        existing.emoji = peerEmoji;
        return existing;
      }
      const pc = new RTCPeerConnection(ICE);
      const stream = new MediaStream();
      const audio = typeof Audio !== "undefined" ? new Audio() : null;
      if (audio) audio.autoplay = true;
      const rec: PeerRec = { pc, stream, audio, emoji: peerEmoji, pending: [], connected: false };
      peersRef.current.set(peerId, rec);

      localStreamRef.current?.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));

      pc.onicecandidate = (e) => {
        if (e.candidate) sendSignal(peerId, "candidate", JSON.stringify(e.candidate.toJSON()));
      };
      pc.ontrack = (e) => {
        const [s] = e.streams;
        if (s) s.getTracks().forEach((t) => rec.stream.addTrack(t));
        else rec.stream.addTrack(e.track);
        if (audio) {
          audio.srcObject = rec.stream;
          audio.play().catch(() => {});
        }
        attachAnalyser(peerId, rec.stream);
      };
      pc.onconnectionstatechange = () => {
        rec.connected = pc.connectionState === "connected";
        syncParticipants();
      };

      // deterministic initiator: the smaller userId makes the offer
      if (userId < peerId) {
        (async () => {
          try {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal(peerId, "offer", JSON.stringify(offer));
          } catch {
            /* will retry on next discovery if peer persists */
          }
        })();
      }
      return rec;
    },
    [userId, sendSignal, attachAnalyser, syncParticipants],
  );

  const teardownPeer = useCallback((peerId: string) => {
    const rec = peersRef.current.get(peerId);
    if (!rec) return;
    try {
      rec.pc.close();
    } catch {
      /* already closed */
    }
    if (rec.audio) {
      try {
        rec.audio.srcObject = null;
      } catch {
        /* noop */
      }
    }
    analysersRef.current.delete(peerId);
    speakingRef.current.delete(peerId);
    peersRef.current.delete(peerId);
  }, []);

  const handleSignal = useCallback(
    async (sig: { from: string; kind: string; data: string }) => {
      const rec =
        peersRef.current.get(sig.from) ??
        establishPeer(sig.from, rosterRef.current.get(sig.from)?.emoji ?? "🌙");
      const pc = rec.pc;
      try {
        if (sig.kind === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(sig.data)));
          for (const c of rec.pending.splice(0)) await pc.addIceCandidate(c).catch(() => {});
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal(sig.from, "answer", JSON.stringify(answer));
        } else if (sig.kind === "answer") {
          if (!pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(sig.data)));
            for (const c of rec.pending.splice(0)) await pc.addIceCandidate(c).catch(() => {});
          }
        } else if (sig.kind === "candidate") {
          const cand = new RTCIceCandidate(JSON.parse(sig.data));
          if (pc.remoteDescription && pc.remoteDescription.type) await pc.addIceCandidate(cand).catch(() => {});
          else rec.pending.push(cand);
        }
      } catch {
        /* a dropped signal stalls one peer at worst; mesh tolerates it */
      }
    },
    [establishPeer, sendSignal],
  );

  const detectSpeaking = useCallback(() => {
    const prev = speakingRef.current;
    const next = new Set<string>();
    for (const [id, { analyser, data }] of analysersRef.current) {
      try {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        if (Math.sqrt(sum / data.length) > SPEAK_THRESHOLD) next.add(id);
      } catch {
        /* analyser gone */
      }
    }
    if (mutedRef.current) next.delete(userId);
    let changed = next.size !== prev.size;
    if (!changed) for (const id of next) if (!prev.has(id)) changed = true;
    if (changed) {
      speakingRef.current = next;
      syncParticipants();
    }
  }, [userId, syncParticipants]);

  const pollOnce = useCallback(async () => {
    if (!inCallRef.current) return;
    let data: { participants?: Roster[]; signals?: { from: string; kind: string; data: string }[] };
    try {
      const res = await fetch(`/api/room/${roomId}/call?me=${encodeURIComponent(userId)}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      data = await res.json();
    } catch {
      return;
    }
    const roster = new Map<string, Roster>();
    for (const p of data.participants ?? []) roster.set(p.userId, p);
    if (!roster.has(userId)) roster.set(userId, { userId, emoji, lastSeen: Date.now() });
    rosterRef.current = roster;

    for (const [pid, p] of roster) if (pid !== userId) establishPeer(pid, p.emoji);
    for (const pid of [...peersRef.current.keys()]) if (!roster.has(pid)) teardownPeer(pid);

    for (const sig of data.signals ?? []) await handleSignal(sig);
    syncParticipants();
  }, [roomId, userId, emoji, establishPeer, teardownPeer, handleSignal, syncParticipants]);

  const heartbeatOnce = useCallback(() => {
    fetch(`/api/room/${roomId}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "heartbeat", userId, emoji }),
    }).catch(() => {});
  }, [roomId, userId, emoji]);

  const join = useCallback(async (): Promise<boolean> => {
    if (!supported || inCallRef.current) return false;
    setJoining(true);
    setError(null);
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setJoining(false);
      setError("mic");
      return false;
    }
    localStreamRef.current = stream;
    mutedRef.current = false;
    setMuted(false);
    inCallRef.current = true;
    setInCall(true);
    attachAnalyser(userId, stream); // my own speaking glow
    rosterRef.current = new Map([[userId, { userId, emoji, lastSeen: Date.now() }]]);
    syncParticipants();

    try {
      await fetch(`/api/room/${roomId}/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join", userId, emoji }),
      });
    } catch {
      /* poll will keep trying */
    }
    heartbeatOnce();
    hbRef.current = setInterval(heartbeatOnce, HEARTBEAT_MS);
    pollRef.current = setInterval(pollOnce, POLL_MS);
    speakRef.current = setInterval(detectSpeaking, SPEAK_MS);
    pollOnce();
    setJoining(false);
    return true;
  }, [supported, roomId, userId, emoji, attachAnalyser, syncParticipants, heartbeatOnce, pollOnce, detectSpeaking]);

  const leave = useCallback(() => {
    inCallRef.current = false;
    for (const r of [pollRef, hbRef, speakRef]) {
      if (r.current) clearInterval(r.current);
      r.current = null;
    }
    for (const pid of [...peersRef.current.keys()]) teardownPeer(pid);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (acRef.current) {
      try {
        acRef.current.close();
      } catch {
        /* noop */
      }
      acRef.current = null;
    }
    analysersRef.current.clear();
    speakingRef.current = new Set();
    rosterRef.current = new Map();
    setParticipants([]);
    setInCall(false);
    setMuted(false);
    fetch(`/api/room/${roomId}/call`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave", userId }),
      keepalive: true,
    }).catch(() => {});
  }, [roomId, userId, teardownPeer]);

  const toggleMute = useCallback(() => {
    const s = localStreamRef.current;
    if (!s) return;
    const next = !mutedRef.current;
    mutedRef.current = next;
    s.getAudioTracks().forEach((t) => (t.enabled = !next));
    setMuted(next);
    if (next) {
      speakingRef.current.delete(userId);
      syncParticipants();
    }
  }, [userId, syncParticipants]);

  // leave cleanly if the component unmounts mid-call
  useEffect(() => {
    return () => {
      if (inCallRef.current) leave();
    };
  }, [leave]);

  return { supported, inCall, joining, muted, participants, error, join, leave, toggleMute };
}
