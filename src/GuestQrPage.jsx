import { useState, useRef, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";

const API_BASE =
  import.meta.env.VITE_GUEST_API_URL || "https://wedding-guest-backend-b9g8.onrender.com/api";
const SITE_URL = "https://wedding-invitation-taupe-seven-44.vercel.app";
const ONE_TIME_NOTE =
  "Please note: this QR code can be used only once — it is scanned at the entrance and will not work a second time. Do not share it with anyone else.";

export default function GuestQrPage({ token }) {
  const [guest, setGuest] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | notfound | error
  const qrRef = useRef(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/guests/qr/${encodeURIComponent(token)}`);
        if (cancelled) return;
        if (res.status === 404) {
          setStatus("notfound");
          return;
        }
        if (!res.ok) {
          setStatus("error");
          return;
        }
        setGuest(await res.json());
        setStatus("ok");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleDownload = () => {
    const canvas = qrRef.current && qrRef.current.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `qr-${(guest?.name || "guest").replace(/\s+/g, "_")}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#efeae0",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 22,
          padding: 28,
          maxWidth: 360,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        {status === "loading" && <p style={{ color: "#6b6a63" }}>Loading your QR code…</p>}
        {status === "notfound" && <p style={{ color: "#b23b3b" }}>This link is not valid.</p>}
        {status === "error" && <p style={{ color: "#b23b3b" }}>Couldn't load your QR code.</p>}

        {status === "ok" && guest && (
          <>
            <p style={{ margin: 0, color: "#6b6a63", fontSize: 13 }}>Your entry pass</p>
            <p style={{ margin: "4px 0 16px", color: "#1f1f1f", fontSize: 20, fontWeight: 700 }}>
              {guest.name}
            </p>
            <div
              ref={qrRef}
              style={{
                display: "flex",
                justifyContent: "center",
                padding: 16,
                background: "#f6f2e8",
                borderRadius: 16,
              }}
            >
              <QRCodeCanvas
                value={`${SITE_URL}/?token=${encodeURIComponent(guest.token)}`}
                size={220}
                bgColor="#f6f2e8"
                fgColor="#1f1f1f"
              />
            </div>
            <p
              style={{
                fontSize: 12,
                color: "#8a6a1f",
                background: "#f4ecc9",
                borderRadius: 12,
                padding: "10px 14px",
                marginTop: 16,
                marginBottom: 0,
                fontWeight: 600,
                lineHeight: 1.5,
              }}
            >
              ⚠️ {ONE_TIME_NOTE}
            </p>
            {guest.arrived && (
              <p
                style={{
                  fontSize: 13,
                  color: "#3f7a35",
                  background: "#e6efd7",
                  borderRadius: 12,
                  padding: "10px 14px",
                  marginTop: 12,
                  marginBottom: 0,
                  fontWeight: 600,
                }}
              >
                You've already checked in — see you inside!
              </p>
            )}
            <button
              onClick={handleDownload}
              style={{
                marginTop: 18,
                width: "100%",
                padding: "12px 0",
                borderRadius: 999,
                border: "none",
                background: saved ? "#e6efd7" : "#141414",
                color: saved ? "#3f7a35" : "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {saved ? "Saved!" : "Save QR to phone"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}