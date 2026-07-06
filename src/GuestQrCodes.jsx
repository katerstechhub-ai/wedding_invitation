import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const SITE_URL = "https://wedding-invitation-taupe-seven-44.vercel.app";

// Point this at your deployed backend (Render, same pattern as MediaHub),
// or http://localhost:5050/api during local dev.
const API_BASE = import.meta.env.VITE_GUEST_API_URL || "http://localhost:5050/api";

// Stored in the browser only so you don't have to retype it every visit.
// It's still checked server-side on every write.
const ADMIN_KEY_STORAGE = "wedding_admin_key";

// ── QR Modal ─────────────────────────────────────────────
function QrModal({ name, onClose }) {
  const canvasWrapperRef = useRef(null);
  const guestUrl = `${SITE_URL}/?guest=${encodeURIComponent(name)}`;

  const handleDownload = () => {
    const canvas = canvasWrapperRef.current.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `qr-${name.replace(/\s+/g, "_")}.png`;
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
        <p style={{ marginTop: 14, fontWeight: 600, fontSize: 16, color: "#3f4632" }}>{name}</p>
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

// ── Small QR thumbnail card (click to open modal) ────────
function GuestCard({ name, onOpen }) {
  return (
    <div
      onClick={() => onOpen(name)}
      style={{
        border: "1px solid #dcd4ba",
        borderRadius: 16,
        padding: 20,
        textAlign: "center",
        backgroundColor: "#fbf8f0",
        cursor: "pointer",
      }}
    >
      <div style={{ pointerEvents: "none" }}>
        <QRCodeCanvas
          value={`${SITE_URL}/?guest=${encodeURIComponent(name)}`}
          size={140}
          bgColor="#fbf8f0"
          fgColor="#3f4632"
        />
      </div>
      <p style={{ marginTop: 10, fontWeight: 500, color: "#3f4632" }}>{name}</p>
      <p style={{ fontSize: 11, color: "#7c8a5e" }}>Tap to view / download</p>
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
                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                  <button
                    onClick={() => onOpenQr(g.name)}
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
  const [bulkText, setBulkText] = useState("");
  const [guests, setGuests] = useState([]);
  const [modalGuest, setModalGuest] = useState(null);
  const [adminKey, setAdminKey] = useState(
    () => localStorage.getItem(ADMIN_KEY_STORAGE) || ""
  );
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const authHeaders = {
    "Content-Type": "application/json",
    "x-admin-key": adminKey,
  };

  const fetchGuests = async () => {
    try {
      setError("");
      const res = await fetch(`${API_BASE}/guests`);
      if (!res.ok) throw new Error("Failed to load guest list");
      const data = await res.json();
      setGuests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    localStorage.setItem(ADMIN_KEY_STORAGE, adminKey);
  }, [adminKey]);

  const handleGenerate = async () => {
    const names = bulkText
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);

    if (names.length === 0) return;

    try {
      setError("");
      const res = await fetch(`${API_BASE}/guests/bulk`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ names }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || "Failed to add guests");
      }
      await fetchGuests();
      setBulkText("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleArrived = async (id) => {
    setBusyId(id);
    try {
      setError("");
      const res = await fetch(`${API_BASE}/guests/${id}/arrival`, {
        method: "PATCH",
        headers: authHeaders,
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
        headers: authHeaders,
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

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#3f4632" }}>Guest QR Codes</h1>
      <p style={{ color: "#5c5848", fontSize: 14 }}>
        Paste one guest name per line, then generate. Each QR opens your invite
        with that guest's name pre-filled. Data is stored on the server, so it
        stays the same across devices and refreshes.
      </p>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: "#5c6b45", display: "block", marginBottom: 4 }}>
          Admin key (needed to add / check-in / delete guests)
        </label>
        <input
          type="password"
          value={adminKey}
          onChange={(e) => setAdminKey(e.target.value)}
          placeholder="Paste your ADMIN_KEY"
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 8,
            border: "1px solid #cabf9e",
            fontSize: 14,
          }}
        />
      </div>

      {error && (
        <p style={{ color: "#b23b3b", fontSize: 13, marginBottom: 12 }}>{error}</p>
      )}

      <textarea
        value={bulkText}
        onChange={(e) => setBulkText(e.target.value)}
        rows={8}
        placeholder={"John\nMary Ann\nDavid"}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 8,
          border: "1px solid #cabf9e",
          fontSize: 14,
        }}
      />

      <button
        onClick={handleGenerate}
        style={{
          marginTop: 12,
          padding: "10px 20px",
          borderRadius: 999,
          border: "none",
          background: "#5c6b45",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Generate QR Codes
      </button>

      {loading ? (
        <p style={{ marginTop: 24, color: "#7c8a5e" }}>Loading guest list…</p>
      ) : (
        <>
          <GuestTable
            guests={guests}
            onToggleArrived={handleToggleArrived}
            onDelete={handleDelete}
            onOpenQr={setModalGuest}
            busyId={busyId}
          />

          <div
            style={{
              marginTop: 24,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 16,
            }}
          >
            {guests.map((g) => (
              <GuestCard key={g._id} name={g.name} onOpen={setModalGuest} />
            ))}
          </div>
        </>
      )}

      {modalGuest && <QrModal name={modalGuest} onClose={() => setModalGuest(null)} />}
    </div>
  );
}