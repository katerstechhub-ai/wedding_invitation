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

export default function CheckInScanner() {
  const [adminKey] = useState(() => localStorage.getItem(ADMIN_KEY_STORAGE) || "");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const scannerRef = useRef(null);
  const containerId = "checkin-reader";

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
        }
      } catch {
        setResult({ error: "Could not reach the server" });
      } finally {
        setBusy(false);
      }
    },
    [busy, adminKey, stopScanner]
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

  // Card shell
  const Shell = ({ children }) => (
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
    </Shell>
  );
}