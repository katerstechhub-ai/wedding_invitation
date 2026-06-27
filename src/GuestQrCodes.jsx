import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

// 🔧 Update this once you've deployed (step 4 below).
const SITE_URL = "https://REPLACE-WITH-YOUR-DEPLOYED-URL.vercel.app";

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

export default function GuestQrCodes() {
  const [bulkText, setBulkText] = useState("");
  const [guests, setGuests] = useState([]);

  const handleGenerate = () => {
    const names = bulkText
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    setGuests(names);
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