import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const SITE_URL = "https://wedding-invitation-taupe-seven-44.vercel.app";
const API_BASE =
  import.meta.env.VITE_GUEST_API_URL || "https://wedding-guest-backend-b9g8.onrender.com/api";
const ADMIN_KEY_STORAGE = "mediahub_wedding_admin_key";

// ── Design tokens ───────────────────────────────────────────
const T = {
  bg: "#efeae0",
  card: "#ffffff",
  soft: "#f6f2e8",
  ink: "#1f1f1f",
  sub: "#6b6a63",
  line: "#ece7d8",
  accent: "#f5c518",
  accentInk: "#1f1f1f",
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

function EyeIcon({ off }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.sub} strokeWidth="2">
      {off ? (
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-10-7-10-7a18.7 18.7 0 0 1 4.22-5.34M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a18.7 18.7 0 0 1-2.16 3.19M1 1l22 22" />
      ) : (
        <>
          <path d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7-11-7-11-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: T.card,
        borderRadius: T.radius,
        padding: 22,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
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

function toneFor(attending) {
  if (attending === "yes") return "good";
  if (attending === "no") return "bad";
  return "warn";
}

// ── Message Modal ───────────────────────────────────────────
function MessageModal({ guest, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,20,10,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.card,
          borderRadius: T.radius,
          padding: 26,
          maxWidth: 400,
          width: "100%",
          boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            width: 30,
            height: 30,
            borderRadius: 999,
            background: T.soft,
            border: "none",
            fontSize: 16,
            color: T.sub,
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          ×
        </button>

        <p style={{ fontWeight: 700, fontSize: 18, color: T.ink, margin: 0 }}>{guest.name}</p>
        {guest.email && (
          <p style={{ fontSize: 12, color: T.sub, marginTop: 2 }}>{guest.email}</p>
        )}

        <div style={{ marginTop: 14 }}>
          <Pill tone={toneFor(guest.attending)}>{guest.attending || "No RSVP yet"}</Pill>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 14,
            background: T.soft,
            fontSize: 14,
            color: T.ink,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
          }}
        >
          {guest.rsvpMessage || "No message left."}
        </div>
      </div>
    </div>
  );
}

// ── QR Modal ────────────────────────────────────────────────
function QrModal({ guest, onClose }) {
  const canvasWrapperRef = useRef(null);
  const guestUrl = `${SITE_URL}/?token=${encodeURIComponent(guest.token)}`;

  const handleDownload = () => {
    const canvas = canvasWrapperRef.current.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${guest.name.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,20,10,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: T.card,
          borderRadius: T.radius,
          padding: 26,
          textAlign: "center",
          maxWidth: 340,
          width: "100%",
          boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            width: 30,
            height: 30,
            borderRadius: 999,
            background: T.soft,
            border: "none",
            fontSize: 16,
            color: T.sub,
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div
          ref={canvasWrapperRef}
          style={{
            display: "flex",
            justifyContent: "center",
            padding: 16,
            background: T.soft,
            borderRadius: 16,
          }}
        >
          <QRCodeCanvas value={guestUrl} size={220} bgColor={T.soft} fgColor={T.ink} />
        </div>
        <p style={{ marginTop: 16, fontWeight: 700, fontSize: 16, color: T.ink }}>{guest.name}</p>
        <p style={{ fontSize: 11, color: T.sub, wordBreak: "break-all", marginTop: 4 }}>
          {guestUrl}
        </p>

        <button
          onClick={handleDownload}
          style={{
            marginTop: 18,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 999,
            border: "none",
            color: T.accentInk,
            background: T.accent,
            cursor: "pointer",
          }}
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}

// ── Guest table ─────────────────────────────────────────────
function GuestTable({ guests, onToggleArrived, onDelete, onOpenQr, onOpenMessage, busyId }) {
  if (guests.length === 0)
    return (
      <p style={{ marginTop: 20, color: T.sub, fontSize: 14 }}>
        No guests yet. Add your first guest above.
      </p>
    );

  const arrivedCount = guests.filter((g) => g.arrived).length;
  const pct = Math.round((arrivedCount / guests.length) * 100);

  return (
    <div style={{ marginTop: 20 }}>
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
              <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "center" }}>QR</th>
              <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "center" }}>Arrived</th>
              <th style={{ padding: "10px 12px", fontWeight: 600 }}>Time</th>
              <th style={{ padding: "10px 12px", fontWeight: 600, textAlign: "center" }}></th>
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
                  <button
                    onClick={() => onOpenMessage(g)}
                    style={{ border: "none", background: "none", padding: 0, cursor: "pointer" }}
                  >
                    <Pill tone={toneFor(g.attending)}>{g.attending || "no RSVP"}</Pill>
                  </button>
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <button
                    onClick={() => onOpenQr(g)}
                    style={{
                      border: "none",
                      background: T.dark,
                      color: "#fff",
                      borderRadius: 999,
                      padding: "6px 14px",
                      fontSize: 12,
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    View
                  </button>
                </td>
                <td style={{ padding: "12px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={g.arrived}
                    disabled={busyId === g._id}
                    onChange={() => onToggleArrived(g._id)}
                    style={{ width: 18, height: 18, cursor: "pointer", accentColor: T.accent }}
                  />
                </td>
                <td style={{ padding: "12px", color: T.sub, fontSize: 12 }}>
                  {g.arrivalTime ? new Date(g.arrivalTime).toLocaleTimeString() : "—"}
                </td>
                <td style={{ padding: "12px", textAlign: "center", borderRadius: "0 12px 12px 0" }}>
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${g.name} from the guest list?`)) {
                        onDelete(g._id);
                      }
                    }}
                    disabled={busyId === g._id}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: T.bad,
                      borderRadius: 8,
                      padding: 4,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
            {/* row spacer */}
            <tr><td colSpan={7} style={{ height: 6 }} /></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function GuestQrCodes() {
  const [quickName, setQuickName] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [guests, setGuests] = useState([]);
  const [modalGuest, setModalGuest] = useState(null);
  const [modalMessage, setModalMessage] = useState(null);

  const [adminKey, setAdminKey] = useState(
    () => localStorage.getItem(ADMIN_KEY_STORAGE) || ""
  );
  const [showKey, setShowKey] = useState(false);
  const [keyStatus, setKeyStatus] = useState("idle");

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const authHeaders = (key = adminKey) => ({
    "Content-Type": "application/json",
    "x-admin-key": key,
  });

  const fetchGuestsWithKey = async (key) => {
    const res = await fetch(`${API_BASE}/guests`, { headers: authHeaders(key) });
    if (res.status === 401) return { ok: false, unauthorized: true };
    if (!res.ok) return { ok: false, unauthorized: false };
    const data = await res.json();
    return { ok: true, data };
  };

  useEffect(() => {
    const key = adminKey.trim();
    if (!key) {
      setKeyStatus("idle");
      setLoading(false);
      return;
    }

    let cancelled = false;
    setKeyStatus("checking");

    const timer = setTimeout(async () => {
      try {
        const result = await fetchGuestsWithKey(key);
        if (cancelled) return;
        if (result.ok) {
          setGuests(result.data);
          localStorage.setItem(ADMIN_KEY_STORAGE, key);
          setKeyStatus("valid");
          setError("");
        } else if (result.unauthorized) {
          setKeyStatus("invalid");
        } else {
          setKeyStatus("offline");
        }
      } catch {
        if (!cancelled) setKeyStatus("offline");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  const fetchGuests = async () => {
    try {
      setError("");
      const res = await fetch(`${API_BASE}/guests`, { headers: authHeaders() });
      if (res.status === 401) {
        setKeyStatus("invalid");
        throw new Error("Admin key no longer valid — please re-enter it.");
      }
      if (!res.ok) throw new Error("Failed to load guest list");
      const data = await res.json();
      setGuests(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const addNames = async (names) => {
    if (names.length === 0) return;
    try {
      setError("");
      const res = await fetch(`${API_BASE}/guests/bulk`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ names }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to add guests");
      }
      await fetchGuests();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    const name = quickName.trim();
    if (!name) return;
    await addNames([name]);
    setQuickName("");
  };

  const handleBulkGenerate = async () => {
    const names = bulkText.split("\n").map((n) => n.trim()).filter(Boolean);
    await addNames(names);
    setBulkText("");
  };

  const handleToggleArrived = async (id) => {
    setBusyId(id);
    try {
      setError("");
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
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      setError("");
      const res = await fetch(`${API_BASE}/guests/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to delete guest");
      }
      setGuests((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleForgetKey = () => {
    localStorage.removeItem(ADMIN_KEY_STORAGE);
    setAdminKey("");
    setGuests([]);
    setKeyStatus("idle");
  };

  const keyStatusLabel = {
    idle: null,
    checking: <span style={{ color: T.sub }}>Checking…</span>,
    valid: <span style={{ color: T.good }}>✓ Saved — you'll stay signed in</span>,
    invalid: <span style={{ color: T.bad }}>Incorrect key</span>,
    offline: <span style={{ color: T.bad }}>Couldn't reach the server</span>,
  }[keyStatus];

  const total = guests.length;
  const arrived = guests.filter((g) => g.arrived).length;
  const rsvpYes = guests.filter((g) => g.attending === "yes").length;

  const canUse = keyStatus === "valid";

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: T.font, padding: "28px 16px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 22,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h1 style={{ color: T.ink, margin: 0, fontSize: 26, fontWeight: 700 }}>Hi, Admin 👋</h1>
            <p style={{ color: T.sub, fontSize: 14, margin: "4px 0 0" }}>
              Manage your guest list and check-ins.
            </p>
          </div>
          {canUse && (
            <button
              onClick={handleForgetKey}
              style={{
                background: T.dark,
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "10px 20px",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 500,
              }}
            >
              Sign out
            </button>
          )}
        </div>

        {/* Stats row */}
        {canUse && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <Card style={{ padding: 18 }}>
              <p style={{ margin: 0, fontSize: 12, color: T.sub }}>Total guests</p>
              <p style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: T.ink }}>{total}</p>
            </Card>
            <Card style={{ padding: 18, background: T.accent }}>
              <p style={{ margin: 0, fontSize: 12, color: T.ink, opacity: 0.7 }}>Arrived</p>
              <p style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: T.ink }}>{arrived}</p>
            </Card>
            <Card style={{ padding: 18, background: T.dark }}>
              <p style={{ margin: 0, fontSize: 12, color: "#c9c9c9" }}>Confirmed yes</p>
              <p style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: "#fff" }}>{rsvpYes}</p>
            </Card>
          </div>
        )}

        {/* Admin key card */}
        <Card style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 12, color: T.sub, display: "block", marginBottom: 8, fontWeight: 600, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Admin key
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type={showKey ? "text" : "password"}
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Paste your ADMIN_KEY"
                style={{
                  width: "100%",
                  padding: "12px 42px 12px 14px",
                  borderRadius: 999,
                  border: "none",
                  background: T.soft,
                  fontSize: 14,
                  color: T.ink,
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? "Hide key" : "Show key"}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 2,
                  display: "flex",
                }}
              >
                <EyeIcon off={showKey} />
              </button>
            </div>
          </div>
          {keyStatusLabel && (
            <p style={{ fontSize: 12, marginTop: 10, marginBottom: 0 }}>{keyStatusLabel}</p>
          )}
        </Card>

        {error && (
          <div
            style={{
              background: T.badBg,
              color: T.bad,
              padding: "10px 14px",
              borderRadius: 12,
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        {/* Add + list card */}
        <Card>
          <h2 style={{ color: T.ink, fontSize: 16, margin: "0 0 14px", fontWeight: 700 }}>Add a guest</h2>
          <form onSubmit={handleQuickAdd} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              value={quickName}
              onChange={(e) => setQuickName(e.target.value)}
              placeholder="Guest name, then press Enter"
              disabled={!canUse}
              style={{
                flex: 1,
                padding: "12px 16px",
                borderRadius: 999,
                border: "none",
                background: T.soft,
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!canUse || !quickName.trim()}
              style={{
                padding: "0 22px",
                borderRadius: 999,
                border: "none",
                background: canUse ? T.accent : T.line,
                color: T.accentInk,
                fontWeight: 600,
                cursor: canUse ? "pointer" : "not-allowed",
              }}
            >
              Add
            </button>
          </form>

          <button
            type="button"
            onClick={() => setBulkOpen((v) => !v)}
            style={{
              background: "none",
              border: "none",
              color: T.sub,
              fontSize: 13,
              cursor: "pointer",
              padding: 0,
              marginTop: 4,
            }}
          >
            {bulkOpen ? "▾ Hide bulk add" : "▸ Add multiple guests at once"}
          </button>

          {bulkOpen && (
            <div style={{ marginTop: 10 }}>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={6}
                placeholder={"John\nMary Ann\nDavid"}
                style={{
                  width: "100%",
                  padding: 14,
                  borderRadius: 16,
                  border: "none",
                  background: T.soft,
                  fontSize: 14,
                  boxSizing: "border-box",
                  fontFamily: T.font,
                  outline: "none",
                  resize: "vertical",
                }}
              />
              <button
                onClick={handleBulkGenerate}
                disabled={!canUse || !bulkText.trim()}
                style={{
                  marginTop: 10,
                  padding: "10px 22px",
                  borderRadius: 999,
                  border: "none",
                  background: canUse ? T.dark : T.line,
                  color: "#fff",
                  cursor: canUse ? "pointer" : "not-allowed",
                  fontWeight: 500,
                }}
              >
                Add all
              </button>
            </div>
          )}

          {loading ? (
            <p style={{ marginTop: 22, color: T.sub }}>Loading guest list…</p>
          ) : !canUse ? (
            <p style={{ marginTop: 22, color: T.sub, fontSize: 14 }}>
              Enter your admin key above to load the guest list.
            </p>
          ) : (
            <GuestTable
              guests={guests}
              onToggleArrived={handleToggleArrived}
              onDelete={handleDelete}
              onOpenQr={setModalGuest}
              onOpenMessage={setModalMessage}
              busyId={busyId}
            />
          )}
        </Card>
      </div>

      {modalGuest && <QrModal guest={modalGuest} onClose={() => setModalGuest(null)} />}
      {modalMessage && <MessageModal guest={modalMessage} onClose={() => setModalMessage(null)} />}
    </div>
  );
}
