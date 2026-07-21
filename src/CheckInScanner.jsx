import { useState, useRef, useEffect, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

const API_BASE =
  import.meta.env.VITE_GUEST_API_URL || "https://wedding-guest-backend-b9g8.onrender.com/api";

// Same slot GuestQrCodes.jsx already saves the admin key into — reuse it
// so staff don't have to type the key in twice.
const ADMIN_KEY_STORAGE = "mediahub_wedding_admin_key";

function extractToken(rawText) {
  try {
    const url = new URL(rawText);
    return url.searchParams.get("token");
  } catch {
    // Not a full URL — treat the scanned text as a raw token
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
        // scanner may already be stopped — safe to ignore
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

  const startScanner = async () => {
    setResult(null);
    setScanning(true);
    const qr = new Html5Qrcode(containerId);
    scannerRef.current = qr;
    try {
      await qr.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 240 },
        handleDecoded,
        () => {} // per-frame decode misses — expected, ignore
      );
    } catch (err) {
      setResult({ error: "Camera access failed: " + err.message });
      setScanning(false);
    }
  };

  useEffect(() => () => { stopScanner(); }, [stopScanner]);

  const scanNext = () => {
    setResult(null);
    startScanner();
  };

  if (!adminKey) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 24, fontFamily: "sans-serif", textAlign: "center" }}>
        <p style={{ color: "#7c8a5e" }}>
          No admin key found. Open the Guest QR Codes page first, enter your admin key there, then come back.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#3f4632", marginBottom: 4 }}>Entrance Check-In</h1>
      <p style={{ color: "#5c5848", fontSize: 14, marginTop: 0 }}>
        Scan a guest's QR code to check them in automatically.
      </p>

      {!scanning && !result && (
        <button
          onClick={startScanner}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "14px 0",
            borderRadius: 10,
            border: "none",
            background: "#5c6b45",
            color: "#fff",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Start Scanning
        </button>
      )}

      <div
        id={containerId}
        style={{
          marginTop: 16,
          display: scanning ? "block" : "none",
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid #dcd4ba",
        }}
      />

      {scanning && (
        <button
          onClick={stopScanner}
          style={{
            marginTop: 12,
            width: "100%",
            padding: "10px 0",
            borderRadius: 10,
            border: "1px solid #b23b3b",
            background: "transparent",
            color: "#b23b3b",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      )}

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 14,
            textAlign: "center",
            background: result.error ? "#f5dede" : result.alreadyCheckedIn ? "#f0ead0" : "#e3f0d5",
            border: `1px solid ${result.error ? "#b23b3b" : result.alreadyCheckedIn ? "#c9a63a" : "#4a7c3f"}`,
          }}
        >
          {result.error ? (
            <p style={{ fontSize: 18, fontWeight: 600, color: "#b23b3b", margin: 0 }}>
              ✕ {result.error}
            </p>
          ) : (
            <>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#3f4632", margin: 0 }}>
                {result.alreadyCheckedIn ? "⚠ Already checked in" : "✓ Checked in"}
              </p>
              <p style={{ fontSize: 18, color: "#3f4632", marginTop: 8 }}>{result.name}</p>
              <p style={{ fontSize: 13, color: "#7c8a5e", textTransform: "capitalize", marginTop: 2 }}>
                RSVP: {result.attending || "none"}
              </p>
            </>
          )}
          <button
            onClick={scanNext}
            style={{
              marginTop: 16,
              padding: "10px 24px",
              borderRadius: 999,
              border: "1px solid #5c6b45",
              color: "#5c6b45",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Scan Next Guest
          </button>
        </div>
      )}
    </div>
  );
}