import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const SITE_URL = "https://wedding-invitation-taupe-seven-44.vercel.app";
const STORAGE_KEY = "wedding_guest_list_v1";

function GuestCard({ name }) {
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
      style={{
        border: "1px solid #dcd4ba",
        borderRadius: 16,
        padding: 20,
        textAlign: "center",
        backgroundColor: "#fbf8f0",
      }}
    >
      <div ref={canvasWrapperRef}>
        <QRCodeCanvas value={guestUrl} size={160} bgColor="#fbf8f0" fgColor="#3f4632" />
      </div>
      <p style={{ marginTop: 10, fontWeight: 500, color: "#3f4632" }}>{name}</p>
      <p style={{ fontSize: 11, color: "#7c8a5e", wordBreak: "break-all" }}>{guestUrl}</p>
      <button
        onClick={handleDownload}
        style={{
          marginTop: 10,
          padding: "6px 14px",
          fontSize: 12,
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
  );
}

// ── Guest tracking table ─────────────────────────────────
function GuestTable({ guests, arrivals, onToggleArrived }) {
  if (guests.length === 0) return null;

  const arrivedCount = guests.filter((g) => arrivals[g]?.arrived).length;

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
              <th style={{ padding: "10px 12px", width: 48 }}>#</th>
              <th style={{ padding: "10px 12px" }}>Guest Name</th>
              <th style={{ padding: "10px 12px", width: 110, textAlign: "center" }}>Arrived</th>
              <th style={{ padding: "10px 12px", width: 160 }}>Arrival Time</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((name, i) => {
              const record = arrivals[name] || { arrived: false, time: null };
              return (
                <tr
                  key={name}
                  style={{
                    borderTop: "1px solid #e5ddc2",
                    background: record.arrived ? "#f1f7e6" : "transparent",
                  }}
                >
                  <td style={{ padding: "8px 12px", color: "#7c8a5e" }}>{i + 1}</td>
                  <td style={{ padding: "8px 12px", color: "#3f4632" }}>{name}</td>
                  <td style={{ padding: "8px 12px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={record.arrived}
                      onChange={() => onToggleArrived(name)}
                      style={{ width: 18, height: 18, cursor: "pointer" }}
                    />
                  </td>
                  <td style={{ padding: "8px 12px", color: "#7c8a5e", fontSize: 12 }}>
                    {record.time ? new Date(record.time).toLocaleTimeString() : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function GuestQrCodes() {
  const [bulkText, setBulkText] = useState("");
  const [guests, setGuests] = useState([]);
  const [arrivals, setArrivals] = useState({});

  // Load saved list + arrival state on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.guests) setGuests(saved.guests);
      if (saved.arrivals) setArrivals(saved.arrivals);
      if (saved.bulkText) setBulkText(saved.bulkText);
    } catch {
      // ignore malformed storage
    }
  }, []);

  // Persist whenever guests or arrivals change
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ guests, arrivals, bulkText })
    );
  }, [guests, arrivals, bulkText]);

  const handleGenerate = () => {
    const names = bulkText
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    setGuests(names);

    // Keep arrival records for names that still exist; drop the rest
    setArrivals((prev) => {
      const next = {};
      names.forEach((n) => {
        if (prev[n]) next[n] = prev[n];
      });
      return next;
    });
  };

  const handleToggleArrived = (name) => {
    setArrivals((prev) => {
      const wasArrived = prev[name]?.arrived;
      return {
        ...prev,
        [name]: {
          arrived: !wasArrived,
          time: !wasArrived ? new Date().toISOString() : null,
        },
      };
    });
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#3f4632" }}>Guest QR Codes</h1>
      <p style={{ color: "#5c5848", fontSize: 14 }}>
        Paste one guest name per line, then generate. Each QR opens your invite
        with that guest's name pre-filled.
      </p>

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

      <GuestTable
        guests={guests}
        arrivals={arrivals}
        onToggleArrived={handleToggleArrived}
      />

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {guests.map((name) => (
          <GuestCard key={name} name={name} />
        ))}
      </div>
    </div>
  );
}