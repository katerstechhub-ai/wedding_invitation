import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const SITE_URL = "https://wedding-invitation-taupe-seven-44.vercel.app";

// Defaults to the live Render backend. Set VITE_GUEST_API_URL in a local
// .env file to point at http://localhost:5050/api when developing locally.
const API_BASE =
  import.meta.env.VITE_GUEST_API_URL || "https://wedding-guest-backend-b9g8.onrender.com/api";

// localStorage slot name — deliberately NOT similar-looking to the actual
// admin key value, to avoid ever mixing the two up again.
const ADMIN_KEY_STORAGE = "mediahub_wedding_admin_key";

// ── Eye / eye-off icon (no external icon lib needed) ─────
function EyeIcon({ off }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5c6b45" strokeWidth="2">
      {off ? (
        <>
          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-10-7-10-7a18.7 18.7 0 0 1 4.22-5.34M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 10 7 10 7a18.7 18.7 0 0 1-2.16 3.19M1 1l22 22" />
        </>
      ) : (
        <>
          <path d="M1 12s3-7 11-7 11 7 11 7-3 7-11 7-11-7-11-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}

// ── QR Modal ─────────────────────────────────────────────
// Takes the whole guest record now (not just a name) — the QR needs the
// guest's token so a scan ties back to their exact record on RSVP.
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
        background: "rgba(20,20,10,0.55)",
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
          background: "#fbf8f0",
          borderRadius: 20,
          padding: 28,
          textAlign: "center",
          maxWidth: 320,
          width: "100%",
          boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 14,
            background: "none",
            border: "none",
            fontSize: 20,
            color: "#7c8a5e",
            cursor: "pointer",
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div ref={canvasWrapperRef} style={{ display: "flex", justifyContent: "center" }}>
          <QRCodeCanvas value={guestUrl} size={220} bgColor="#fbf8f0" fgColor="#3f4632" />
        </div>
        <p style={{ marginTop: 14, fontWeight: 600, fontSize: 16, color: "#3f4632" }}>{guest.name}</p>
        <p style={{ fontSize: 11, color: "#7c8a5e", wordBreak: "break-all", marginTop: 4 }}>
          {guestUrl}
        </p>

        <button
          onClick={handleDownload}
          style={{
            marginTop: 16,
            padding: "8px 18px",
            fontSize: 13,
            borderRadius: 999,
            border: "1px solid #5c6b45",
            color: "#5c6b45",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          Download PNG
        </button>
      </div>
    </div>
  );
}

// ── Guest tracking table ─────────────────────────────────
function GuestTable({ guests, onToggleArrived, onDelete, onOpenQr, busyId }) {
  if (guests.length === 0) return null;

  const arrivedCount = guests.filter((g) => g.arrived).length;

  return (
    <div style={{ marginTop: 32 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <h2 style={{ color: "#3f4632", fontSize: 18, margin: 0 }}>Guest List</h2>
        <span style={{ fontSize: 13, color: "#5c6b45", fontWeight: 600 }}>
          {arrivedCount} / {guests.length} arrived
        </span>
      </div>

      <div style={{ overflowX: "auto", border: "1px solid #dcd4ba", borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#efe9d6", color: "#3f4632", textAlign: "left" }}>
              <th style={{ padding: "10px 12px", width: 40 }}>#</th>
              <th style={{ padding: "10px 12px" }}>Guest Name</th>
              <th style={{ padding: "10px 12px" }}>RSVP</th>
              <th style={{ padding: "10px 12px", width: 90, textAlign: "center" }}>QR</th>
              <th style={{ padding: "10px 12px", width: 100, textAlign: "center" }}>Arrived</th>
              <th style={{ padding: "10px 12px", width: 150 }}>Arrival Time</th>
              <th style={{ padding: "10px 12px", width: 70, textAlign: "center" }}>Delete</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g, i) => (
              <tr
                key={g._id}
                style={{
                  borderTop: "1px solid #e5ddc2",
                  background: g.arrived ? "#f1f7e6" : "transparent",
                  opacity: busyId === g._id ? 0.5 : 1,
                }}
              >
                <td style={{ padding: "8px 12px", color: "#7c8a5e" }}>{i + 1}</td>
                <td style={{ padding: "8px 12px", color: "#3f4632" }}>{g.name}</td>
                <td style={{ padding: "8px 12px", color: "#7c8a5e", fontSize: 12, textTransform: "capitalize" }}>
                  {g.attending || "—"}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                  <button
                    onClick={() => onOpenQr(g)}
                    style={{
                      border: "1px solid #5c6b45",
                      color: "#5c6b45",
                      background: "transparent",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    View
                  </button>
                </td>
                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                  <input
                    type="checkbox"
                    checked={g.arrived}
                    disabled={busyId === g._id}
                    onChange={() => onToggleArrived(g._id)}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                </td>
                <td style={{ padding: "8px 12px", color: "#7c8a5e", fontSize: 12 }}>
                  {g.arrivalTime ? new Date(g.arrivalTime).toLocaleTimeString() : "—"}
                </td>
                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${g.name} from the guest list?`)) {
                        onDelete(g._id);
                      }
                    }}
                    disabled={busyId === g._id}
                    style={{
                      border: "1px solid #b23b3b",
                      color: "#b23b3b",
                      background: "transparent",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
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

  const [adminKey, setAdminKey] = useState(
    () => localStorage.getItem(ADMIN_KEY_STORAGE) || ""
  );
  const [showKey, setShowKey] = useState(false);
  // "idle" | "checking" | "valid" | "invalid" | "offline"
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

  // Validate + load whenever adminKey changes (including the very first
  // render, since adminKey starts out populated from localStorage). This
  // is what makes the table survive a page refresh, and it's also what
  // saves the key the first time it's typed in — no separate login step.
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
    }, 400); // debounce so we don't fire a request on every keystroke

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
    checking: <span style={{ color: "#7c8a5e" }}>Checking…</span>,
    valid: <span style={{ color: "#4a7c3f" }}>✓ Saved — will stay logged in on refresh</span>,
    invalid: <span style={{ color: "#b23b3b" }}>Incorrect key</span>,
    offline: <span style={{ color: "#b23b3b" }}>Couldn't reach the server</span>,
  }[keyStatus];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#3f4632", marginBottom: 4 }}>Guest QR Codes</h1>
      <p style={{ color: "#5c5848", fontSize: 14, marginTop: 0 }}>
        Each QR opens your invite tied to that guest's own record, so their
        RSVP and check-in stay linked — no matter how many times they scan it.
      </p>

      {/* ── Admin key ───────────────────────────────── */}
      <div
        style={{
          background: "#fbf8f0",
          border: "1px solid #dcd4ba",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <label style={{ fontSize: 12, color: "#5c6b45", display: "block", marginBottom: 6 }}>
          Admin key
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              type={showKey ? "text" : "password"}
              id="admin-key"
              name="admin-key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Paste your ADMIN_KEY"
              style={{
                width: "100%",
                padding: "8px 40px 8px 10px",
                borderRadius: 8,
                border: "1px solid #cabf9e",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              aria-label={showKey ? "Hide key" : "Show key"}
              style={{
                position: "absolute",
                right: 8,
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
          {keyStatus === "valid" && (
            <button
              type="button"
              onClick={handleForgetKey}
              style={{
                fontSize: 12,
                color: "#7c8a5e",
                background: "none",
                border: "1px solid #cabf9e",
                borderRadius: 8,
                padding: "0 12px",
                cursor: "pointer",
              }}
            >
              Forget
            </button>
          )}
        </div>
        {keyStatusLabel && (
          <p style={{ fontSize: 12, marginTop: 6, marginBottom: 0 }}>{keyStatusLabel}</p>
        )}
      </div>

      {error && <p style={{ color: "#b23b3b", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {/* ── Quick add (one guest at a time, press Enter) ── */}
      <form onSubmit={handleQuickAdd} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input
          type="text"
          value={quickName}
          onChange={(e) => setQuickName(e.target.value)}
          placeholder="Add a guest by name and press Enter"
          disabled={keyStatus !== "valid"}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #cabf9e",
            fontSize: 14,
          }}
        />
        <button
          type="submit"
          disabled={keyStatus !== "valid" || !quickName.trim()}
          style={{
            padding: "0 18px",
            borderRadius: 8,
            border: "none",
            background: keyStatus === "valid" ? "#5c6b45" : "#b7bfa4",
            color: "#fff",
            cursor: keyStatus === "valid" ? "pointer" : "not-allowed",
          }}
        >
          Add
        </button>
      </form>

      {/* ── Bulk add, tucked away since it's used less often ── */}
      <button
        type="button"
        onClick={() => setBulkOpen((v) => !v)}
        style={{
          background: "none",
          border: "none",
          color: "#5c6b45",
          fontSize: 13,
          cursor: "pointer",
          padding: 0,
          marginBottom: bulkOpen ? 8 : 0,
        }}
      >
        {bulkOpen ? "▾ Hide bulk add" : "▸ Add multiple guests at once"}
      </button>

      {bulkOpen && (
        <div style={{ marginBottom: 12 }}>
          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={6}
            placeholder={"John\nMary Ann\nDavid"}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 8,
              border: "1px solid #cabf9e",
              fontSize: 14,
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleBulkGenerate}
            disabled={keyStatus !== "valid" || !bulkText.trim()}
            style={{
              marginTop: 10,
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              background: keyStatus === "valid" ? "#5c6b45" : "#b7bfa4",
              color: "#fff",
              cursor: keyStatus === "valid" ? "pointer" : "not-allowed",
            }}
          >
            Add all
          </button>
        </div>
      )}

      {loading ? (
        <p style={{ marginTop: 24, color: "#7c8a5e" }}>Loading guest list…</p>
      ) : keyStatus !== "valid" ? (
        <p style={{ marginTop: 24, color: "#7c8a5e", fontSize: 14 }}>
          Enter the admin key above to load and manage the guest list.
        </p>
      ) : (
        <GuestTable
          guests={guests}
          onToggleArrived={handleToggleArrived}
          onDelete={handleDelete}
          onOpenQr={setModalGuest}
          busyId={busyId}
        />
      )}

      {modalGuest && <QrModal guest={modalGuest} onClose={() => setModalGuest(null)} />}
    </div>
  );
}