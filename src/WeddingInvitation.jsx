import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  FaInstagram, FaMapMarkerAlt, FaVolumeUp, FaVolumeMute, FaHeart,
  FaHome, FaUserFriends, FaCalendarAlt, FaEnvelopeOpenText, FaLandmark,
  FaCamera, FaScroll, FaHandPointer,
} from "react-icons/fa";

import pamsPhoto from "./assets/pams.jpeg";
import bizzerPhoto from "./assets/Bizzer.jpeg";
import SEAL_URL from "./assets/stark-seal.png";
import guestUploadPreview from "./assets/guest-upload-preview.jpeg";
import dresscodeImage from "./assets/dresscode.jpeg";

// ─────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────
const COUPLE = {
  hashtag: "#BIZZERPAMSWEDDING",
  groom: {
    nickname: "Bizzer",
    fullName: "Kenneth Tesem Gbugho",
    parents: ["Mr. Gbugho Amokaha Donald", "Mrs. Gbugho Juliana"],
    instagram: "https://instagram.com/",
    photo: bizzerPhoto,
  },
  bride: {
    nickname: "Pams",
    fullName: "Paloma Austin",
    parents: ["Mr. Budi Dharma", "Mrs. Susan Dharma"],
    instagram: "https://instagram.com/",
    photo: pamsPhoto,
  },
};

const EVENT = {
  verse:
    "“So they are no longer two, but one flesh. Therefore what God has joined together, let no one separate.”",
  verseRef: "Matthew 19:6",
  day: "SATURDAY",
  date: "21 OCTOBER 2026",
  ceremonyTime: "18.00 WIB",
  afterPartyTime: "21.00 WIB",
  venueName: "Lausanne Ballroom — Swissôtel PIK Jakarta",
  venueAddress:
    "Jl. Pantai Indah Kapuk, Kamal Muara, Penjaringan, Jakarta Utara",
  mapsUrl: "https://maps.google.com",
  weddingDateTimeISO: "2026-10-21T18:00:00+07:00",
};

const GALLERY = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800&auto=format&fit=crop",
];

const HERO_VIDEO_POSTER =
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1400&auto=format&fit=crop";

const BG_AMBIENT_MUSIC_URL = "";
const GUEST_UPLOAD_URL = "https://mediahub-frontend-4tdp.vercel.app";

// Same backend used by the admin QR page. Set VITE_GUEST_API_URL in a
// local .env to point at http://localhost:5050/api when developing.
const API_BASE =
  import.meta.env.VITE_GUEST_API_URL || "https://wedding-guest-backend-b9g8.onrender.com/api";

const RSVP_DONE_KEY = "wi_rsvp_done_v1";

// ─────────────────────────────────────────────────────────
// Global styles
// ─────────────────────────────────────────────────────────
function GlobalInviteStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=IM+Fell+English:ital@0;1&family=UnifrakturMaguntia&display=swap');

      html, body { overflow-x: hidden; max-width: 100%; }

      .wi-root {
        overflow-x: hidden; max-width: 100%;
        font-family: 'IM Fell English', 'Cormorant Garamond', Georgia, serif;
        font-weight: 400; letter-spacing: 0.01em;
        -webkit-font-smoothing: antialiased;
      }
      .wi-root .font-serif {
        font-family: 'Cinzel', 'Trajan Pro', serif !important;
        font-weight: 500; letter-spacing: 0.06em;
      }
      .wi-root .font-black-letter {
        font-family: 'UnifrakturMaguntia', 'Cinzel', serif !important;
        letter-spacing: 0.02em;
      }

      .wi-grain { position: relative; }
      .wi-grain::after {
        content: ""; position: absolute; inset: 0; pointer-events: none;
        background-image:
          radial-gradient(ellipse at 12% 18%, rgba(90,50,20,0.18), transparent 40%),
          radial-gradient(ellipse at 88% 82%, rgba(70,35,15,0.22), transparent 45%),
          radial-gradient(circle at 60% 30%, rgba(120,70,25,0.10), transparent 35%),
          url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.32  0 0 0 0 0.20  0 0 0 0 0.08  0 0 0 0.09 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        mix-blend-mode: multiply; opacity: 0.55;
      }

      .wi-goldline { background: linear-gradient(90deg, transparent, #9c7a2e 20%, #e2c874 50%, #9c7a2e 80%, transparent); }
      .wi-inkline  { background: linear-gradient(90deg, transparent, #2a1a0a 20%, #5a3a1a 50%, #2a1a0a 80%, transparent); }

      .wi-ancient {
        background:
          radial-gradient(ellipse at 15% 20%, rgba(90,45,10,0.35), transparent 55%),
          radial-gradient(ellipse at 85% 80%, rgba(60,25,5,0.45), transparent 55%),
          radial-gradient(circle at 50% 50%, rgba(210,170,100,0.15), transparent 70%),
          linear-gradient(160deg, #c9a866 0%, #a8813f 45%, #7d5822 100%);
      }
      .wi-ancient-stains::before {
        content:""; position:absolute; inset:0; pointer-events:none;
        background-image:
          radial-gradient(circle at 22% 30%, rgba(40,20,5,0.55) 0 6px, transparent 8px),
          radial-gradient(circle at 78% 25%, rgba(40,20,5,0.35) 0 4px, transparent 6px),
          radial-gradient(circle at 30% 78%, rgba(40,20,5,0.4) 0 8px, transparent 12px),
          radial-gradient(ellipse at 60% 65%, rgba(30,15,5,0.28), transparent 40%),
          radial-gradient(ellipse at 10% 60%, rgba(30,15,5,0.35), transparent 35%);
        opacity: .85;
      }
      .wi-ancient-fiber::after {
        content:""; position:absolute; inset:0; pointer-events:none;
        background-image:
          url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.20  0 0 0 0 0.10  0 0 0 0 0.02  0 0 0 0.45 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        mix-blend-mode: multiply; opacity: .75;
      }
      .wi-burnt-edge {
        -webkit-mask-image:
          radial-gradient(ellipse at 50% 50%, #000 62%, transparent 78%),
          url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><filter id='r'><feTurbulence baseFrequency='0.02' numOctaves='2'/><feDisplacementMap in='SourceGraphic' scale='30'/></filter><rect width='100%25' height='100%25' fill='black' filter='url(%23r)'/></svg>");
        -webkit-mask-composite: source-over;
        mask-image: radial-gradient(ellipse at 50% 50%, #000 62%, transparent 78%);
      }
      .wi-scorched::after {
        content:""; position:absolute; inset:0; pointer-events:none;
        background:
          radial-gradient(ellipse at 0% 0%, rgba(20,8,0,0.85), transparent 22%),
          radial-gradient(ellipse at 100% 0%, rgba(20,8,0,0.8), transparent 22%),
          radial-gradient(ellipse at 0% 100%, rgba(20,8,0,0.85), transparent 22%),
          radial-gradient(ellipse at 100% 100%, rgba(20,8,0,0.85), transparent 22%);
        mix-blend-mode: multiply;
      }

      @keyframes wi-candle {
        0%,100% { opacity: .88; filter: brightness(1); }
        50%     { opacity: 1;   filter: brightness(1.15); }
      }
      .wi-candle { animation: wi-candle 3.6s ease-in-out infinite; }

      @keyframes wi-tap-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
      @keyframes wi-tap-ripple { 0% { transform: scale(.55); opacity:.85; } 100% { transform: scale(1.9); opacity:0; } }
      .wi-tap-icon { animation: wi-tap-bob 1.6s ease-in-out infinite; }
      .wi-tap-ripple { animation: wi-tap-ripple 1.6s ease-out infinite; }

      @keyframes wi-pulse-dot {
        0%,100% { transform: scale(1); opacity: 1; }
        50%     { transform: scale(1.5); opacity: 0.6; }
      }
      .wi-pulse-dot { animation: wi-pulse-dot 1.4s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .wi-tap-icon, .wi-tap-ripple, .wi-candle, .wi-pulse-dot { animation: none; }
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────
// Decorative corner
// ─────────────────────────────────────────────────────────
function FloralCorner({ className = "", flip = false, tone = "ink" }) {
  const c =
    tone === "gold"
      ? { line: "#9c7a2e", dot: "#7a1220" }
      : { line: "#3a2a17", dot: "#7a1220" };
  return (
    <svg
      viewBox="0 0 180 180"
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path d="M10 170 C 40 120, 80 80, 170 10" stroke={c.line} strokeWidth="1.2" fill="none" />
      <path d="M10 170 C 60 140, 100 100, 170 40" stroke={c.line} strokeWidth="0.8" fill="none" opacity="0.6" />
      {[[40,150],[65,125],[95,105],[125,85],[155,55]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r="2" fill={c.dot} />
      ))}
    </svg>
  );
}

function SectionDivider({ symbol = "✦" }) {
  return (
    <div className="my-10 flex items-center justify-center gap-3 px-8">
      <div className="wi-goldline h-px flex-1" />
      <span style={{ color: "#7a1220", fontSize: 14 }}>{symbol}</span>
      <div className="wi-goldline h-px flex-1" />
    </div>
  );
}

const FALLBACK_PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='600'><rect width='100%' height='100%' fill='#c9a866'/><text x='50%' y='50%' text-anchor='middle' fill='#3a2a17' font-family='serif' font-size='24'>Photo</text></svg>`
  );

function ArchFrame({ src, alt, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay }}
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius: "50% 50% 8px 8px / 40% 40% 8px 8px",
        border: "1px solid #7a5a2c",
      }}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_PHOTO; }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Countdown
// ─────────────────────────────────────────────────────────
function useCountdown(targetISO) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date(targetISO).getTime();
    const tick = () => {
      const diff = Math.max(0, target - Date.now());
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetISO]);
  return time;
}

function CountdownBlock({ value, label }) {
  const str = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-lg font-serif text-2xl"
        style={{
          background: "linear-gradient(160deg,#1c1a15,#2a2b1e)",
          color: "#efe3c2",
          border: "1px solid #c9a24a",
        }}
      >
        {str}
      </div>
      <span className="mt-2 text-[10px] uppercase" style={{ color: "#7a5a2c", letterSpacing: "0.25em" }}>
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Bottom nav
// ─────────────────────────────────────────────────────────
function BottomNav({ active, onNavigate, rsvpDone }) {
  const items = [
    { id: "home", icon: FaHome, label: "Home" },
    { id: "couple", icon: FaUserFriends, label: "Houses" },
    { id: "event", icon: FaCalendarAlt, label: "Event" },
    { id: "rsvp", icon: FaEnvelopeOpenText, label: "Raven" },
  ];
  return (
    <div
      className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full px-2 py-1.5"
      style={{
        background: "linear-gradient(135deg,#1c1a15,#0a0a07)",
        border: "1px solid #c9a24a",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        const needsAttention = item.id === "rsvp" && !rsvpDone;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="relative flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] transition"
            style={{ color: isActive ? "#efe3c2" : "#9c7a2e" }}
          >
            {isActive && (
              <span
                className="absolute inset-0 -z-0 rounded-full"
                style={{ background: "linear-gradient(135deg,#7a1220,#4a0a12)" }}
              />
            )}
            <span className="relative" style={{ position: "relative" }}>
              <Icon className="relative" size={14} />
              {needsAttention && (
                <span
                  className="wi-pulse-dot absolute rounded-full"
                  style={{
                    top: -3, right: -4, width: 6, height: 6,
                    background: "#e8a24a", border: "1px solid #1c1a15",
                  }}
                />
              )}
            </span>
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Dress Code section
// ─────────────────────────────────────────────────────────
function DressCodeSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.9 }}
      className="px-6"
    >
      <h3
        className="text-center font-serif text-[10px] uppercase"
        style={{ color: "#7a1220", letterSpacing: "0.35em" }}
      >
        Attire of the Realm
      </h3>
      <p
        className="mt-2 text-center font-black-letter text-3xl"
        style={{ color: "#7a1220" }}
      >
        Black Tie
      </p>
      <p
        className="mx-auto mt-3 max-w-sm text-center text-sm italic"
        style={{ color: "#4a3820" }}
      >
        We ask our guests to dress in the spirit of the evening — gentlemen
        in black or white, ladies in rich, natural tones.
      </p>

      <div
        className="relative mx-auto mt-6 max-w-md overflow-hidden"
        style={{
          borderRadius: 14,
          border: "1px solid #7a5a2c",
          boxShadow: "0 12px 30px rgba(30,15,5,0.25)",
        }}
      >
        <img
          src={dresscodeImage}
          alt="Black tie wedding dress code reference — men in black and white, women in espresso, burgundy, ruby, olive, or sage"
          className="block w-full"
        />
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────
// RSVP form
// ─────────────────────────────────────────────────────────
function WishesForm({ token, prefillName, onSubmitted }) {
  const [name, setName] = useState(prefillName || "");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [attending, setAttending] = useState(""); // no default — guest must actively choose
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (prefillName) setName(prefillName);
  }, [prefillName]);

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Please tell us your name.";
    if (!email.trim()) errs.email = "Please enter your email.";
    else if (!EMAIL_RE.test(email.trim())) errs.email = "That email doesn't look right.";
    if (!attending) errs.attending = "Please let us know — yes, maybe, or no.";
    if (!message.trim()) errs.message = "Please leave a word for the couple.";
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setStatus("error");
      setErrorMsg("Please fill in everything below before sending your raven.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE}/guests/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token || undefined,
          name,
          email,
          attending,
          message,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(body.message || "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("sent");
      setMessage("");
      onSubmitted?.();
    } catch {
      setErrorMsg("Could not reach the server — try again shortly.");
      setStatus("error");
    }
  };

  const fieldBorder = (field) =>
    fieldErrors[field] ? "1px solid #b23b3b" : "1px solid #7a5a2c";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="mx-6 rounded-3xl px-6 py-8"
      style={{
        background: "linear-gradient(180deg,#f4e6bd,#d9c088)",
        border: "1px solid #7a5a2c",
      }}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label className="text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.3em" }}>
            Your Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            readOnly={!!token}
            className="mt-1 w-full bg-transparent pb-2 text-sm outline-none"
            style={{
              borderBottom: fieldBorder("name"),
              color: "#1c1a15",
              opacity: token ? 0.75 : 1,
            }}
            placeholder="Enter your name, my lord/lady"
          />
          {fieldErrors.name && (
            <p className="mt-1 text-xs" style={{ color: "#b23b3b" }}>{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label className="text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.3em" }}>
            Your Email *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-transparent pb-2 text-sm outline-none"
            style={{ borderBottom: fieldBorder("email"), color: "#1c1a15" }}
            placeholder="In case we need to reach you"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-xs" style={{ color: "#b23b3b" }}>{fieldErrors.email}</p>
          )}
        </div>

        <div>
          <label className="text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.3em" }}>
            Will you answer the summons? *
          </label>
          <div
            className="mt-2 flex gap-2 rounded-full p-1"
            style={{ border: fieldErrors.attending ? "1px solid #b23b3b" : "1px solid transparent" }}
          >
            {["yes", "maybe", "no"].map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => { setAttending(opt); setFieldErrors((f) => ({ ...f, attending: undefined })); }}
                className="flex-1 rounded-full px-3 py-1.5 text-xs capitalize transition"
                style={
                  attending === opt
                    ? { border: "1px solid #7a1220", background: "linear-gradient(135deg,#7a1220,#4a0a12)", color: "#efe3c2" }
                    : { border: "1px solid #7a5a2c", color: "#4a3820" }
                }
              >
                {opt}
              </button>
            ))}
          </div>
          {fieldErrors.attending && (
            <p className="mt-1 text-xs" style={{ color: "#b23b3b" }}>{fieldErrors.attending}</p>
          )}
        </div>

        <div>
          <label className="text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.3em" }}>
            A word for the betrothed *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-none bg-transparent pb-2 text-sm outline-none"
            style={{ borderBottom: fieldBorder("message"), color: "#1c1a15" }}
            placeholder="Write your blessing..."
          />
          {fieldErrors.message && (
            <p className="mt-1 text-xs" style={{ color: "#b23b3b" }}>{fieldErrors.message}</p>
          )}
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={status === "sending"}
          className="w-full rounded-full py-3 text-xs uppercase"
          style={{
            letterSpacing: "0.28em",
            color: "#efe3c2",
            background: "linear-gradient(135deg, #7a1220 0%, #4a0a12 100%)",
            border: "1px solid #c9a24a",
            opacity: status === "sending" ? 0.7 : 1,
          }}
        >
          {status === "sending" ? "Sending Raven…" : "Send a Raven"}
        </motion.button>

        {status === "sent" && (
          <p className="text-center text-xs" style={{ color: "#4a0a12" }}>
            The raven has flown — your response has been received 🕊
          </p>
        )}
        {status === "error" && (
          <p className="text-center text-xs font-semibold" style={{ color: "#7a1220" }}>
            {errorMsg || "The raven could not fly — try again shortly."}
          </p>
        )}
      </form>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Guest photo upload
function GuestUploadSection() {
  return (
    <section className="px-6 py-16" style={{ background: "#efe3c2" }}>
      <p className="font-serif text-center text-[11px]" style={{ letterSpacing: "0.4em", color: "#7a1220" }}>
        RAVENS OF THE REALM
      </p>
      <h2 className="font-serif mt-2 text-center text-2xl" style={{ color: "#1c1a15", letterSpacing: "0.1em" }}>
        Share Your Chronicle
      </h2>
      <div className="wi-goldline mx-auto mt-3 h-px w-24" />

      <p className="mx-auto mt-5 max-w-sm text-center text-sm italic" style={{ color: "#4a3820" }}>
        Every guest is a keeper of memory. Upload the moments you capture at our
        feast — that our saga may be told in full.
      </p>

      <div
        className="mx-auto mt-8 overflow-hidden"
        style={{
          maxWidth: 220,
          borderRadius: 8,
          border: "1px solid #7a5a2c",
          background: "#1c1a15",
        }}
      >
        <img
          src={guestUploadPreview}
          alt="Preview of the guest photo upload page"
          className="block w-full"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      <div className="mt-8 flex justify-center">
        <a
          href={GUEST_UPLOAD_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[11px] uppercase"
          style={{
            letterSpacing: "0.3em",
            color: "#efe3c2",
            background: "linear-gradient(135deg,#7a1220,#4a0a12)",
            border: "1px solid #c9a24a",
            fontFamily: "'Cinzel', serif",
          }}
        >
          <FaCamera /> Upload Your Photos
        </a>
      </div>

      <p className="mt-4 text-center text-[10px]" style={{ letterSpacing: "0.3em", color: "#7a5a2c" }}>
        <FaScroll className="mr-2 inline-block" />
        BEAR WITNESS · KEEP THE MEMORY
      </p>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// Tap hint
// ─────────────────────────────────────────────────────────
function TapHint({ label = "Break the Seal" }) {
  return (
    <div className="flex flex-col items-center">
      <span style={{ fontFamily: "'Cinzel', serif", fontSize: 10, letterSpacing: "0.4em", color: "#c9a24a" }}>
        {label}
      </span>
      <div className="wi-tap-icon relative mt-3" style={{ width: 36, height: 36 }}>
        <span className="wi-tap-ripple absolute inset-1 rounded-full" style={{ border: "1.4px solid #c9a24a" }} />
        <svg width="36" height="36" viewBox="0 0 34 34" fill="none" stroke="#c9a24a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}>
          <path d="M13.5 18.5V9.6a1.7 1.7 0 0 1 3.4 0V17" />
          <path d="M16.9 17V8.2a1.7 1.7 0 0 1 3.4 0V17" />
          <path d="M20.3 17v-5.6a1.7 1.7 0 0 1 3.4 0v8.7c0 3.2-2.3 5.7-6 5.7h-1.9c-1.9 0-2.9-.6-4-1.9l-2.8-3.4c-.6-.8-.4-1.7.4-2.2.7-.5 1.5-.3 2.1.3l1.7 1.8" />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Wax medallion
// ─────────────────────────────────────────────────────────
function WaxDisc() {
  return (
    <div
      style={{
        width: "100%", height: "100%",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #7a1220 0%, #4a0a12 100%)",
        border: "1px solid #c9a24a",
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <img
        src={SEAL_URL}
        alt="House seal"
        style={{ width: "70%", height: "70%", objectFit: "contain" }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Cover screen
// ─────────────────────────────────────────────────────────
function CoverScreen({ onOpen, guestName }) {
  const [phase, setPhase] = useState("idle");
  const cracked  = phase !== "idle";
  const opening  = phase === "opening" || phase === "revealed";
  const revealed = phase === "revealed";

  const handleTap = () => {
    if (phase !== "idle") return;
    setPhase("cracking");
    setTimeout(() => setPhase("opening"),  650);
    setTimeout(() => setPhase("revealed"), 1500);
  };

  const LEFT_HALF_CLIP =
    "polygon(0 0, 50% 0, 46% 8%, 54% 18%, 44% 30%, 52% 42%, 43% 55%, 51% 68%, 44% 82%, 50% 100%, 0 100%)";
  const RIGHT_HALF_CLIP =
    "polygon(50% 0, 100% 0, 100% 100%, 50% 100%, 44% 82%, 51% 68%, 43% 55%, 52% 42%, 44% 30%, 54% 18%, 46% 8%)";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #2a1a0a 0%, #120a04 60%, #05030a 100%)",
      }}
    >
      <div
        className="wi-candle pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 45%, rgba(220,150,60,0.20), transparent 55%)",
        }}
      />
      {[...Array(14)].map((_, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            background: "#e8a24a",
            left: `${(i * 73) % 100}%`,
            top: `${60 + ((i * 37) % 30)}%`,
            filter: "blur(0.5px)",
            opacity: 0.7,
          }}
          animate={{ y: [-10, -180], opacity: [0.9, 0] }}
          transition={{ duration: 6 + (i % 4), repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
        />
      ))}

      <div
        role="button"
        tabIndex={0}
        onClick={handleTap}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleTap()}
        className="relative"
        style={{
          width: "min(84vw, 380px)",
          height: "min(86svh, 560px)",
          cursor: phase === "idle" ? "pointer" : "default",
          perspective: 1400,
        }}
      >
      <div
          className="wi-ancient wi-ancient-stains wi-ancient-fiber absolute inset-0 overflow-hidden"
          style={{
            borderRadius: 6,
            border: "1px solid #7a5a2c",
          }}
        >
          <div
            className="absolute pointer-events-none"
            style={{
              inset: 18,
              border: "1px solid rgba(120,85,30,0.55)",
            }}
          />

          <motion.div
            initial={false}
            animate={revealed ? { y: 0, opacity: 1 } : { y: 40, opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: revealed ? 0.15 : 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
            style={{ color: "#2a1a08", pointerEvents: revealed ? "auto" : "none" }}
          >
            <div className="wi-inkline h-px w-16 opacity-70" />
            <p className="font-serif mt-4 text-[10px]" style={{ letterSpacing: "0.4em", color: "#5a3a1a" }}>
              TWO GREAT HOUSES UNITE
            </p>
            <p className="font-black-letter mt-6 text-5xl" style={{ color: "#3a1a08" }}>&</p>
            <h1 className="font-serif mt-3 text-2xl" style={{ letterSpacing: "0.12em", color: "#2a1408" }}>
              {COUPLE.groom.nickname} & {COUPLE.bride.nickname}
            </h1>
            <div className="wi-inkline mt-5 h-px w-24 opacity-70" />
            {guestName && (
              <div
                className="mt-5 rounded-full px-5 py-2"
                style={{
                  background: "rgba(122,18,32,0.08)",
                  border: "1px solid rgba(122,18,32,0.35)",
                }}
              >
                <p
                  className="font-serif text-[9px] uppercase"
                  style={{ letterSpacing: "0.3em", color: "#5a3a1a" }}
                >
                  A summons unto
                </p>
                <p
                  className="mt-1 text-lg font-bold"
                  style={{ color: "#7a1220", letterSpacing: "0.02em" }}
                >
                  {guestName}
                </p>
              </div>
            )}
            <p className="font-serif mt-4 text-[10px]" style={{ letterSpacing: "0.35em", color: "#5a3a1a" }}>
              {EVENT.date.toUpperCase()}
            </p>

            <div className="relative mt-8">
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-sm"
                style={{ border: "1px solid #c9a24a" }}
                animate={{ scale: [1, 1.18, 1], opacity: [0.9, 0, 0.9] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.button
                onClick={(e) => { e.stopPropagation(); onOpen(); }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="relative inline-flex items-center gap-2"
                style={{
                  borderRadius: 2,
                  padding: "10px 22px",
                  fontFamily: "'Cinzel', serif",
                  fontSize: 10,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: "#f2dfae",
                  background: "linear-gradient(135deg,#5a0a10 0%, #2a0508 100%)",
                  border: "1px solid #8a6a28",
                }}
              >
                <FaHandPointer size={11} />
                Enter the Great Hall
              </motion.button>
              <p
                className="mt-2 text-center"
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 9,
                  letterSpacing: "0.35em",
                  color: "#7a1220",
                }}
              >
                ↑ TAP TO ENTER
              </p>
            </div>
          </motion.div>

          {/* Peeling flap */}
          <motion.div
            initial={false}
            animate={opening ? { rotateX: -178, opacity: revealed ? 0 : 1 } : { rotateX: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.7, 0, 0.3, 1] }}
            className="wi-ancient wi-ancient-stains wi-ancient-fiber absolute left-0 right-0 top-0 flex items-start justify-center"
            style={{
              height: "58%",
              transformOrigin: "top center",
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              borderBottom: "1px solid rgba(60,30,10,0.6)",
              backfaceVisibility: "hidden",
              pointerEvents: revealed ? "none" : "auto",
            }}
          >
            <p
              className="font-black-letter mt-8 text-lg"
              style={{ color: "#3a1a08", letterSpacing: "0.05em" }}
            >
              Wedding is Coming
            </p>

            <div
              className="absolute"
              style={{
                top: "38%",
                left: "50%",
                width: 96,
                height: 96,
                transform: "translate(-50%, -20%)",
              }}
            >
              <motion.div
                initial={false}
                animate={cracked ? { x: -38, y: 10, rotate: -28, opacity: 0.95 } : { x: 0, y: 0, rotate: 0 }}
                transition={{ duration: 0.55, ease: [0.7, 0, 0.3, 1] }}
                style={{
                  position: "absolute", inset: 0,
                  clipPath: LEFT_HALF_CLIP,
                }}
              >
                <WaxDisc />
              </motion.div>
              <motion.div
                initial={false}
                animate={cracked ? { x: 38, y: 10, rotate: 28, opacity: 0.95 } : { x: 0, y: 0, rotate: 0 }}
                transition={{ duration: 0.55, ease: [0.7, 0, 0.3, 1] }}
                style={{
                  position: "absolute", inset: 0,
                  clipPath: RIGHT_HALF_CLIP,
                }}
              >
                <WaxDisc />
              </motion.div>
            </div>
          </motion.div>
        </div>

        {phase === "idle" && (
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
            <TapHint />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// RSVP reminder toast
// ─────────────────────────────────────────────────────────
function RsvpReminder({ onScrollToRsvp, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 px-5 py-3"
      style={{
        width: "min(90vw, 340px)",
        borderRadius: 16,
        background: "linear-gradient(135deg,#1c1a15,#0a0a07)",
        border: "1px solid #c9a24a",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
      }}
    >
      <p className="text-xs font-semibold" style={{ color: "#efe3c2" }}>
        You haven't sent your raven yet 🕊
      </p>
      <p className="mt-1 text-[11px]" style={{ color: "#c9a24a" }}>
        Please RSVP so we know to expect you.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onScrollToRsvp}
          className="flex-1 rounded-full py-1.5 text-[10px] uppercase"
          style={{
            letterSpacing: "0.2em",
            color: "#1c1a15",
            background: "#c9a24a",
          }}
        >
          RSVP now
        </button>
        <button
          onClick={onDismiss}
          className="rounded-full px-3 py-1.5 text-[10px] uppercase"
          style={{ letterSpacing: "0.2em", color: "#9c7a2e", border: "1px solid #4a3a1e" }}
        >
          Later
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────
export default function WeddingInvitation({ guestName: guestNameProp = "" }) {
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [guestName, setGuestName] = useState(guestNameProp);
  const [guestToken, setGuestToken] = useState("");
  const [rsvpDone, setRsvpDone] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(RSVP_DONE_KEY) === "1"
  );
  const [showReminder, setShowReminder] = useState(false);
  const audioRef = useRef(null);
  const countdown = useCountdown(EVENT.weddingDateTimeISO);

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.08]);

  const sectionRefs = {
    home: useRef(null), couple: useRef(null),
    event: useRef(null), rsvp: useRef(null),
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const g = params.get("guest");

    if (token) {
      setGuestToken(token);
      fetch(`${API_BASE}/guests/by-token/${token}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((guest) => { if (guest?.name) setGuestName(guest.name); })
        .catch(() => {});
    } else if (g) {
      setGuestName(decodeURIComponent(g));
    }
  }, []);

  useEffect(() => {
    if (!opened) document.body.style.overflow = "hidden";
    else { document.body.style.overflow = ""; window.scrollTo(0, 0); }
    return () => { document.body.style.overflow = ""; };
  }, [opened]);

  // Gently nudge guests who haven't RSVP'd yet — appears a little while
  // after opening the invite, not immediately, so it doesn't feel like a wall.
  useEffect(() => {
    if (!opened || rsvpDone) return;
    const id = setTimeout(() => setShowReminder(true), 15000);
    return () => clearTimeout(id);
  }, [opened, rsvpDone]);

  // Best-effort nudge if someone tries to close/leave the tab without RSVPing.
  // Browsers show their own generic message and ignore custom text, but it
  // still gives guests one more chance to notice before they leave.
  useEffect(() => {
    const handler = (e) => {
      if (rsvpDone) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [rsvpDone]);

  const scrollTo = (id) => {
    setActiveNav(id);
    setShowReminder(false);
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRsvpSubmitted = () => {
    localStorage.setItem(RSVP_DONE_KEY, "1");
    setRsvpDone(true);
    setShowReminder(false);
  };

  useEffect(() => {
    if (opened && audioRef.current && !muted) audioRef.current.play().catch(() => {});
  }, [opened, muted]);

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div
      className="wi-root wi-grain relative min-h-screen w-full"
      style={{
        backgroundColor: "#efe3c2",
        backgroundImage: "linear-gradient(180deg, #efe3c2 0%, #d9c493 100%)",
        color: "#1c1a15",
      }}
    >
      <GlobalInviteStyles />

      {BG_AMBIENT_MUSIC_URL && <audio ref={audioRef} src={BG_AMBIENT_MUSIC_URL} loop />}

      <AnimatePresence>
        {!opened && <CoverScreen onOpen={() => setOpened(true)} guestName={guestName} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: opened ? 1 : 0 }}
        transition={{ duration: 0.9, delay: opened ? 0.2 : 0 }}
        className="mx-auto max-w-md pb-28"
      >
        {opened && BG_AMBIENT_MUSIC_URL && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="fixed right-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: "linear-gradient(135deg,#7a1220,#4a0a12)", color: "#efe3c2", border: "1px solid #c9a24a" }}
          >
            {muted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
          </button>
        )}

        {/* HERO */}
        <section ref={sectionRefs.home} className="relative px-6 pt-12 text-center">
          <motion.p initial="hidden" animate="show" variants={fadeUp}
            className="font-black-letter text-4xl" style={{ color: "#7a1220" }}>
            &
          </motion.p>

          <motion.div ref={heroRef} style={{ y: heroY, scale: heroScale }} className="mx-auto mt-6">
            <ArchFrame src={HERO_VIDEO_POSTER} alt="Cover" className="mx-auto h-[440px] w-[290px]" />
          </motion.div>

          <motion.h2 initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="mt-8 font-serif text-3xl"
            style={{ color: "#1c1a15", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {COUPLE.groom.nickname} <span style={{ color: "#7a1220" }}>&</span> {COUPLE.bride.nickname}
          </motion.h2>
          <motion.p initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="mt-2 text-xs uppercase" style={{ color: "#7a5a2c", letterSpacing: "0.3em" }}>
            {COUPLE.groom.fullName} & {COUPLE.bride.fullName}
          </motion.p>
        </section>

        <SectionDivider />

        {/* VERSE */}
        <motion.section
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.9 }}
          className="relative mx-6 overflow-hidden rounded-3xl px-8 py-12 text-center wi-grain"
          style={{
            background: "linear-gradient(160deg, #1c1a15 0%, #2a2b1e 100%)",
            border: "1px solid #c9a24a",
          }}
        >
          <FloralCorner className="absolute -right-6 -top-6 h-24 w-24 opacity-40" tone="gold" />
          <FloralCorner className="absolute -bottom-6 -left-6 h-24 w-24 opacity-40" tone="gold" flip />
          <p className="font-serif text-lg italic leading-relaxed" style={{ color: "#efe3c2" }}>
            {EVENT.verse}
          </p>
          <p className="mt-4 text-xs uppercase" style={{ color: "#c9a24a", letterSpacing: "0.3em" }}>
            {EVENT.verseRef}
          </p>
        </motion.section>

        <SectionDivider symbol="✦" />

        {/* HOUSES */}
        <section ref={sectionRefs.couple} className="px-6">
          <h3 className="text-center font-serif text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.35em" }}>
            The Two Houses
          </h3>

          {[COUPLE.groom, COUPLE.bride].map((p, idx) => (
            <motion.div key={idx}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="mt-10 text-center"
            >
              <ArchFrame src={p.photo} alt={p.nickname} className="mx-auto h-80 w-60" />
              <p className="mt-6 font-black-letter text-3xl" style={{ color: "#7a1220" }}>{p.nickname}</p>
              <p className="mt-1 font-serif text-lg" style={{ color: "#1c1a15", letterSpacing: "0.06em" }}>{p.fullName}</p>
              <p className="mt-3 text-[10px] uppercase" style={{ color: "#7a5a2c", letterSpacing: "0.3em" }}>
                {idx === 0 ? "Son of House" : "Daughter of House"}
              </p>
              <p className="mt-1 text-sm italic" style={{ color: "#3a2a17" }}>{p.parents[0]}</p>
              <p className="text-sm italic" style={{ color: "#3a2a17" }}>& {p.parents[1]}</p>
              <motion.a whileHover={{ scale: 1.1, rotate: 6 }} whileTap={{ scale: 0.95 }}
                href={p.instagram} target="_blank" rel="noreferrer"
                className="mx-auto mt-5 flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #7a1220, #4a0a12)", color: "#efe3c2", border: "1px solid #c9a24a" }}
              >
                <FaInstagram size={16} />
              </motion.a>
            </motion.div>
          ))}

          <div className="mt-10 text-center font-black-letter text-5xl" style={{ color: "#7a1220" }}>&</div>
        </section>

        <SectionDivider />

        {/* WITH HONOR */}
        <section className="relative overflow-hidden px-10 text-center">
          <FloralCorner className="absolute -left-2 top-0 h-20 w-20 opacity-50" />
          <FloralCorner className="absolute -right-2 top-0 h-20 w-20 opacity-50" flip />
          <motion.h3 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="mt-6 font-serif text-2xl" style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
            With Honor.
          </motion.h3>
          <p className="mt-3 text-sm italic leading-relaxed" style={{ color: "#3a2a17" }}>
            We summon you to bear witness to our joining.
          </p>
        </section>

        {/* EVENT DETAILS */}
        <motion.section
          ref={sectionRefs.event}
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.9 }}
          className="relative mx-6 mt-8 overflow-hidden rounded-[42px] px-6 pb-10 pt-10 text-center wi-grain"
          style={{
            background: "linear-gradient(180deg, #f4e6bd 0%, #d9c088 100%)",
            border: "1px solid #7a5a2c",
          }}
        >
          <FloralCorner className="absolute -top-4 -right-4 h-20 w-20 opacity-50" tone="gold" flip />

          <p className="font-serif text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.35em" }}>
            {EVENT.day}
          </p>
          <p className="mt-2 font-serif text-2xl" style={{ letterSpacing: "0.08em" }}>{EVENT.date}</p>
          <p className="mt-1 text-xs uppercase" style={{ color: "#7a5a2c", letterSpacing: "0.25em" }}>
            Ceremony · {EVENT.ceremonyTime}
          </p>

          <div className="wi-goldline my-5 h-px w-2/3 mx-auto" />

          <p className="font-serif text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.35em" }}>
            The Feast
          </p>
          <p className="mt-1 text-xs uppercase" style={{ color: "#7a5a2c", letterSpacing: "0.25em" }}>
            {EVENT.afterPartyTime}
          </p>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 14 }}
            className="mt-6 flex justify-center" style={{ color: "#7a1220" }}
          >
            <FaLandmark size={26} />
          </motion.div>
          <p className="mt-3 font-serif text-lg leading-snug" style={{ letterSpacing: "0.04em" }}>{EVENT.venueName}</p>
          <p className="mt-2 text-xs italic" style={{ color: "#7a5a2c" }}>{EVENT.venueAddress}</p>

          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
            href={EVENT.mapsUrl} target="_blank" rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[10px] uppercase"
            style={{
              letterSpacing: "0.3em",
              color: "#efe3c2",
              background: "linear-gradient(135deg, #7a1220 0%, #4a0a12 100%)",
              border: "1px solid #c9a24a",
            }}
          >
            <FaMapMarkerAlt size={12} /> Find the Castle
          </motion.a>
        </motion.section>

        <SectionDivider symbol="✦" />

        {/* DRESS CODE */}
        <DressCodeSection />

        {/* COUNTDOWN */}
        <section className="relative mt-14 px-6 text-center">
          <div className="flex justify-center gap-3">
            <CountdownBlock value={countdown.days} label="Days" />
            <CountdownBlock value={countdown.hours} label="Hours" />
            <CountdownBlock value={countdown.minutes} label="Minutes" />
            <CountdownBlock value={countdown.seconds} label="Seconds" />
          </div>

          <motion.p whileHover={{ scale: 1.05 }}
            className="mt-6 inline-block rounded-full px-5 py-2 text-[10px] uppercase"
            style={{
              letterSpacing: "0.3em",
              color: "#efe3c2",
              background: "linear-gradient(135deg, #7a1220, #4a0a12)",
              border: "1px solid #c9a24a",
            }}
          >
            {COUPLE.hashtag}
          </motion.p>

          <ArchFrame src={GALLERY[0]} alt="" className="mx-auto mt-8 h-64 w-64" />

          <p className="mt-6 font-serif text-lg italic" style={{ color: "#7a1220" }}>
            May the Lord bless and keep our union.
          </p>
        </section>

        <SectionDivider symbol="✦" />

        {/* GALLERY */}
        <section className="px-6">
          <h3 className="text-center font-serif text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.35em" }}>
            Chronicles
          </h3>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {GALLERY.map((src, i) => (
              <ArchFrame key={i} src={src} alt={`Gallery ${i + 1}`} className="h-48 w-full" delay={i * 0.08} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <motion.button whileHover={{ scale: 1.04, backgroundColor: "#7a1220", color: "#efe3c2" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[10px] uppercase"
              style={{ letterSpacing: "0.3em", border: "1px solid #7a1220", color: "#7a1220", background: "transparent" }}
            >
              <FaInstagram size={12} /> Our Saga
            </motion.button>
          </div>
        </section>

        <SectionDivider />

        {/* GUEST PHOTO UPLOAD */}
        <GuestUploadSection />

        <SectionDivider symbol="✦" />

        {/* RSVP */}
        <section ref={sectionRefs.rsvp}>
          <h3 className="text-center font-serif text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.35em" }}>
            Send a Raven
          </h3>
          <p className="mt-2 text-center font-black-letter text-3xl" style={{ color: "#7a1220" }}>
            Answer the Summons
          </p>
          <div className="mt-6">
            <WishesForm token={guestToken} prefillName={guestName} onSubmitted={handleRsvpSubmitted} />
          </div>
        </section>

        {/* FOOTER */}
        <motion.footer
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-10 py-12 text-center"
          style={{
            background: "linear-gradient(180deg, #1c1a15 0%, #0a0a07 100%)",
            color: "#efe3c2",
            borderTop: "1px solid #c9a24a",
          }}
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            style={{ color: "#7a1220" }}>
            <FaHeart className="mx-auto mb-4" size={22} />
          </motion.div>
          <p className="font-black-letter text-3xl" style={{ color: "#efe3c2" }}>
            {COUPLE.groom.nickname} & {COUPLE.bride.nickname}
          </p>
          <p className="mt-2 text-[10px] uppercase opacity-80" style={{ letterSpacing: "0.35em", color: "#c9a24a" }}>
            {EVENT.date}
          </p>
        </motion.footer>
      </motion.div>

      {opened && <BottomNav active={activeNav} onNavigate={scrollTo} rsvpDone={rsvpDone} />}

      <AnimatePresence>
        {opened && showReminder && !rsvpDone && (
          <RsvpReminder
            onScrollToRsvp={() => scrollTo("rsvp")}
            onDismiss={() => setShowReminder(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}