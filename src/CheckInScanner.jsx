import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

const API_BASE =
  import.meta.env.VITE_GUEST_API_URL || "https://wedding-guest-backend-b9g8.onrender.com/api";
const ADMIN_KEY_STORAGE = "mediahub_wedding_admin_key";

const T = {
  bg: "#efeae0",
  card: "#ffffff",
  soft: "#f6f2e8",
  ink: "#1f1f1f",
  sub: "#6b6a63",
  accent: "#f5c518",
  dark: "#141414",
  good: "#3f7a35",
  goodBg: "#e6efd7",
  bad: "#b23b3b",
  badBg: "#f6dede",
  warn: "#8a6a1f",
  warnBg: "#f4ecc9",
  radius: 22,
  font:
    "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
};

function extractToken(rawText) {
  try {
    const url = new URL(rawText);
    return url.searchParams.get("token");
  } catch {
    return rawText.trim() || null;
  }
}

function toneFor(attending) {
  if (attending === "yes") return "good";
  if (attending === "no") return "bad";
  return "warn";
}

function Pill({ children, tone = "muted" }) {
  const tones = {
    good: { bg: T.goodBg, fg: T.good },
    bad: { bg: T.badBg, fg: T.bad },
    warn: { bg: T.warnBg, fg: T.warn },
    muted: { bg: T.soft, fg: T.sub },
  };
  const c = tones[tone];
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "capitalize",
        padding: "4px 10px",
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        letterSpacing: 0.2,
      }}
    >
      {children}
    </span>
  );
}

// Same guest table as the Guest QR Codes page, minus the RSVP-message
// click-through and the QR/delete columns — this page is just for
// watching who's arrived while scanning.
function ArrivalsTable({ guests, onMarkArrived, busyId }) {
  if (guests.length === 0)
    return (
      <p style={{ marginTop: 20, color: T.sub, fontSize: 14 }}>
        No guests yet.
      </p>
    );

  const arrivedCount = guests.filter((g) => g.arrived).length;
  const pct = Math.round((arrivedCount / guests.length) * 100);

  return (
    <div style={{ marginTop: 24 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ color: T.ink, fontSize: 18, margin: 0, fontWeight: 700 }}>Guest List</h2>
          <p style={{ margin: 0, color: T.sub, fontSize: 12 }}>
            {arrivedCount} of {guests.length} arrived
          </p>
        </div>
        <div style={{ flex: "1 1 180px", maxWidth: 260 }}>
          <div style={{ height: 8, background: T.soft, borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: T.accent,
                transition: "width .3s",
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 14 }}>
          <thead>
            <tr style={{ textAlign: "left", color: T.sub, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6 }}>
              <th style={{ padding: "10px 12px", fontWeight: 600 }}>#</th>
              <th style={{ padding: "10px 12px", fontWeight: 600 }}>Guest</th>
              <th style={{ padding: "10px 12px", fontWeight: 600 }}>RSVP</th>
              <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "center" }}>Arrived</th>
              <th style={{ padding: "10px 12px", fontWeight: 600 }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g, i) => (
              <tr
                key={g._id}
                style={{
                  background: g.arrived ? T.goodBg : T.soft,
                  opacity: busyId === g._id ? 0.5 : 1,
                }}
              >
                <td style={{ padding: "12px", color: T.sub, borderRadius: "12px 0 0 12px" }}>{i + 1}</td>
                <td style={{ padding: "12px", color: T.ink, fontWeight: 600 }}>{g.name}</td>
                <td style={{ padding: "12px" }}>
                  <Pill tone={toneFor(g.attending)}>{g.attending || "no RSVP"}</Pill>
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  {g.arrived ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        background: T.good,
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                      aria-label="Arrived"
                      title="Arrived"
                    >
                      ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => onMarkArrived(g._id)}
                      disabled={busyId === g._id}
                      style={{
                        border: "none",
                        background: T.dark,
                        color: "#fff",
                        borderRadius: 999,
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: busyId === g._id ? "default" : "pointer",
                      }}
                    >
                      Mark arrived
                    </button>
                  )}
                </td>
                <td style={{ padding: "12px", color: T.sub, fontSize: 12, borderRadius: "0 12px 12px 0" }}>
                  {g.arrivalTime ? new Date(g.arrivalTime).toLocaleTimeString() : "—"}
                </td>
              </tr>
            ))}
            <tr><td colSpan={5} style={{ height: 6 }} /></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Fallback for guests without a QR code on hand. Deliberately requires
// picking the exact guest and confirming, rather than a single tap, so it
// isn't a low-friction way to wave people in.
function ManualCheckIn({ guests, onMarkArrived, busyId }) {
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(null); // guest object pending confirmation

  const matches =
    query.trim().length < 2
      ? []
      : guests
          .filter((g) => g.name.toLowerCase().includes(query.trim().toLowerCase()))
          .slice(0, 8);

  const confirm = async () => {
    if (!confirming) return;
    await onMarkArrived(confirming._id);
    setConfirming(null);
    setQuery("");
  };

  return (
    <div
      style={{
        background: T.card,
        borderRadius: T.radius,
        padding: 22,
        marginTop: 16,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <h2 style={{ color: T.ink, fontSize: 16, margin: "0 0 6px", fontWeight: 700 }}>
        No QR code?
      </h2>
      <p style={{ color: T.sub, fontSize: 13, margin: "0 0 12px" }}>
        Search their name and confirm — only use this when a guest genuinely can't present their code.
      </p>
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setConfirming(null); }}
        placeholder="Type guest name…"
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: 999,
          border: "none",
          background: T.soft,
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      {matches.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {matches.map((g) => (
            <div
              key={g._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 12,
                background: T.soft,
              }}
            >
              <span style={{ fontSize: 14, color: T.ink, fontWeight: 600 }}>{g.name}</span>
              {g.arrived ? (
                <Pill tone="good">already arrived</Pill>
              ) : (
                <button
                  onClick={() => setConfirming(g)}
                  style={{
                    border: "none",
                    background: T.dark,
                    color: "#fff",
                    borderRadius: 999,
                    padding: "6px 14px",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Check in
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {query.trim().length >= 2 && matches.length === 0 && (
        <p style={{ color: T.sub, fontSize: 13, marginTop: 10 }}>No matching guest found.</p>
      )}

      {confirming && (
        <div
          onClick={() => setConfirming(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20,20,10,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: T.card,
              borderRadius: T.radius,
              padding: 24,
              maxWidth: 340,
              width: "100%",
              textAlign: "center",
            }}
          >
            <p style={{ color: T.sub, fontSize: 13, margin: 0 }}>Confirm arrival for</p>
            <p style={{ color: T.ink, fontSize: 20, fontWeight: 700, margin: "6px 0 18px" }}>
              {confirming.name}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={() => setConfirming(null)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: T.soft,
                  color: T.sub,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={busyId === confirming._id}
                style={{
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "none",
                  background: T.accent,
                  color: T.ink,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {busyId === confirming._id ? "Checking in…" : "Confirm check-in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Card shell — kept at module scope (not defined inside CheckInScanner) so
// its component identity stays stable across re-renders. Defining it inside
// the component would recreate the function every render, which makes React
// unmount and remount the whole subtree below it (including ManualCheckIn)
// on every re-render — wiping out the search box's local state every time
// the guest list polls.
function Shell({ children }) {
  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font, padding: "28px 16px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ color: T.ink, margin: 0, fontSize: 26, fontWeight: 700 }}>Entrance Check-In</h1>
          <p style={{ color: T.sub, fontSize: 14, margin: "4px 0 0" }}>
            Scan a guest's QR to mark them as arrived.
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function CheckInScanner() {
  const [adminKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) || "");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef(null);
  const containerId = "checkin-reader";

  const [guests, setGuests] = useState([]);
  const [guestsLoading, setGuestsLoading] = useState(true);
  const [guestsError, setGuestsError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    "x-admin-key": adminKey,
  });

  const fetchGuests = useCallback(async () => {
    if (!adminKey) {
      setGuestsLoading(false);
      return;
    }
    try {
      setGuestsError("");
      const res = await fetch(`${API_BASE}/guests`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load guest list");
      const data = await res.json();
      setGuests(data);
    } catch (err) {
      setGuestsError(err.message);
    } finally {
      setGuestsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // Quiet polling so this table stays in sync with check-ins happening on
  // the scanner page (or another admin's tab) without needing a websocket.
  useEffect(() => {
    if (!adminKey) return;
    const id = setInterval(fetchGuests, 6000);
    return () => clearInterval(id);
  }, [adminKey, fetchGuests]);

  const handleMarkArrived = async (id) => {
    const guest = guests.find((g) => g._id === id);
    if (guest?.arrived) return; // already arrived — this page can't undo it

    setBusyId(id);
    try {
      setGuestsError("");
      const res = await fetch(`${API_BASE}/guests/${id}/arrival`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to update arrival status");
      }
      const updated = await res.json();
      setGuests((prev) => prev.map((g) => (g._id === id ? updated : g)));
    } catch (err) {
      setGuestsError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {
        /* already stopped */
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }, []);

  const handleDecoded = useCallback(
    async (decodedText) => {
      if (busy) return;
      const token = extractToken(decodedText);
      if (!token) return;

      setBusy(true);
      await stopScanner();

      try {
        const res = await fetch(`${API_BASE}/guests/checkin/${token}`, {
          method: "PATCH",
          headers: { "x-admin-key": adminKey },
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          setResult({ error: body.message || "Check-in failed" });
        } else {
          setResult({
            name: body.name,
            attending: body.attending,
            alreadyCheckedIn: body.alreadyCheckedIn,
          });
          fetchGuests(); // keep the table in sync with the scan
        }
      } catch {
        setResult({ error: "Could not reach the server" });
      } finally {
        setBusy(false);
      }
    },
    [busy, adminKey, stopScanner, fetchGuests]
  );

  // ─── FIX: startScanner with a small delay ───
  const startScanner = async () => {
    setResult(null);
    setScanning(true);

    // Wait a tick so the DOM renders the container
    await new Promise(r => setTimeout(r, 100));

    const qr = new Html5Qrcode(containerId);
    scannerRef.current = qr;

    try {
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 240 },
        handleDecoded,
        () => {} // ignore scan errors
      );
    } catch (err) {
      setResult({ error: `Camera error: ${err.message}` });
      setScanning(false);
      scannerRef.current = null;
    }
  };

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  const scanNext = () => {
    setResult(null);
    startScanner();
  };

  if (!adminKey) {
    return (
      <Shell>
        <div
          style={{
            background: T.card,
            borderRadius: T.radius,
            padding: 24,
            textAlign: "center",
            color: T.sub,
            fontSize: 14,
          }}
        >
          No admin key found. Open the <strong>Guest QR Codes</strong> page first, enter your key, then come back.
        </div>
      </Shell>
    );
  }

  const resultTone = result?.error
    ? { bg: T.badBg, fg: T.bad }
    : result?.alreadyCheckedIn
    ? { bg: T.warnBg, fg: T.warn }
    : { bg: T.goodBg, fg: T.good };

  return (
    <Shell>
      <div
        style={{
          background: T.card,
          borderRadius: T.radius,
          padding: 22,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        {!scanning && !result && (
          <div style={{ textAlign: "center", padding: "10px 0 4px" }}>
            <div
              style={{
                width: 92,
                height: 92,
                margin: "10px auto 18px",
                borderRadius: "50%",
                background: T.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 42,
              }}
              aria-hidden
            >
              📷
            </div>
            <p style={{ margin: 0, color: T.sub, fontSize: 14 }}>
              Point your camera at the guest's QR code.
            </p>
            <button
              onClick={startScanner}
              style={{
                marginTop: 18,
                width: "100%",
                padding: "14px 0",
                borderRadius: 999,
                border: "none",
                background: T.dark,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start Scanning
            </button>
          </div>
        )}

        {/* ─── Scanner container with minHeight ─── */}
        <div
          id={containerId}
          style={{
            display: scanning ? "block" : "none",
            borderRadius: 16,
            overflow: "hidden",
            background: T.soft,
            minHeight: 240, // 👈 ensures the scanner has space
          }}
        />

        {scanning && (
          <button
            onClick={stopScanner}
            style={{
              marginTop: 14,
              width: "100%",
              padding: "12px 0",
              borderRadius: 999,
              border: "none",
              background: T.soft,
              color: T.bad,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}

        {result && (
          <div
            style={{
              marginTop: 6,
              padding: 22,
              borderRadius: 18,
              textAlign: "center",
              background: resultTone.bg,
            }}
          >
            {result.error ? (
              <p style={{ fontSize: 17, fontWeight: 700, color: resultTone.fg, margin: 0 }}>
                ✕ {result.error}
              </p>
            ) : (
              <>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: "#fff",
                    color: resultTone.fg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                    margin: "0 auto 10px",
                  }}
                >
                  {result.alreadyCheckedIn ? "!" : "✓"}
                </div>
                <p style={{ fontSize: 15, fontWeight: 600, color: resultTone.fg, margin: 0 }}>
                  {result.alreadyCheckedIn ? "Already checked in" : "Checked in"}
                </p>
                <p style={{ fontSize: 20, color: T.ink, marginTop: 10, marginBottom: 0, fontWeight: 700 }}>
                  {result.name}
                </p>
                <p style={{ fontSize: 12, color: T.sub, textTransform: "capitalize", marginTop: 4 }}>
                  RSVP: {result.attending || "none"}
                </p>
              </>
            )}

            <button
              onClick={scanNext}
              style={{
                marginTop: 18,
                padding: "12px 26px",
                borderRadius: 999,
                border: "none",
                background: T.accent,
                color: T.ink,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Scan next guest
            </button>
          </div>
        )}
      </div>

      {!guestsLoading && (
        <ManualCheckIn guests={guests} onMarkArrived={handleMarkArrived} busyId={busyId} />
      )}

      {guestsError && (
        <div
          style={{
            background: T.badBg,
            color: T.bad,
            padding: "10px 14px",
            borderRadius: 12,
            fontSize: 13,
            marginTop: 14,
          }}
        >
          {guestsError}
        </div>
      )}

      <div
        style={{
          background: T.card,
          borderRadius: T.radius,
          padding: 22,
          marginTop: 16,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        {guestsLoading ? (
          <p style={{ color: T.sub, fontSize: 14 }}>Loading guest list…</p>
        ) : (
          <ArrivalsTable guests={guests} onMarkArrived={handleMarkArrived} busyId={busyId} />
        )}
      </div>
    </Shell>
  );
}