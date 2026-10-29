import { useState, useEffect, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  FaInstagram, FaMapMarkerAlt, FaVolumeUp, FaVolumeMute, FaHeart,
  FaHome, FaUserFriends, FaCalendarAlt, FaEnvelopeOpenText, FaLandmark,
  FaCamera, FaScroll, FaHandPointer,
} from "react-icons/fa";

import SEAL_URL from "./assets/stark-seal.png";
import dresscodeImage from "./assets/dresscode.jpeg";

// Photos — imported by their exact file names in src/assets.
import couple1 from "./assets/couple1.jpg";
import couple2 from "./assets/couple2.jpg";
import couple3 from "./assets/couple3.jpg";
import couple4 from "./assets/couple4.jpg";
import couple5 from "./assets/couple5.jpg";
import couple6 from "./assets/couple6.jpg";
import bride1 from "./assets/bride1.jpg";
import bride2 from "./assets/bride2.jpg";
import bride3 from "./assets/bride3.jpg";
import groom1 from "./assets/groom1.jpg";
import groom2 from "./assets/groom2.jpg";
import groom3 from "./assets/groom3.jpg";
// Groom's portrait for "The Two Houses" (change the extension if yours isn't .png)
import groomSuite from "./assets/groom_suite-clean.jpg";

// New "-clean" photos (image-clean, image-2-clean ... image-5-clean).
// Looked up by file name, so .jpg / .jpeg / .png all work.
const CLEAN_FILES = import.meta.glob("./assets/image*-clean.{jpg,jpeg,png,webp,JPG,JPEG,PNG}", {
  eager: true,
  import: "default",
});
const CLEAN = {};
const cleanKeys = Object.keys(CLEAN_FILES);
for (let i = 0; i < cleanKeys.length; i++) {
  const file = cleanKeys[i].split("/").pop();
  CLEAN[file.substring(0, file.lastIndexOf("."))] = CLEAN_FILES[cleanKeys[i]];
}
const imageClean = CLEAN["image-clean"];
const image2Clean = CLEAN["image-2-clean"];
const image3Clean = CLEAN["image-3-clean"];
const image4Clean = CLEAN["image-4-clean"];
const image5Clean = CLEAN["image-5-clean"];

// ─────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────
const COUPLE = {
  hashtag: "#TELoveStory2026",
  groom: {
    nickname: "Bizzer",
    fullName: "Kenneth Tesem Gbugho",
    origin: ["of Tyuluv Ward,", "Ukum LGA,", "Benue State."],
    parents: ["Mr. Gbugho Amokaha Donald", "Mrs. Gbugho Juliana"],
    instagram: "https://www.instagram.com/bizzare_ix?igsh=OW1pN2ExM2NqeXc2&igsi=OW1pN2ExM2NqeXc2",
    photo: groom3,
  },
  bride: {
    nickname: "Paloma",
    fullName: "Ruth Enuwa Ameh",
    origin: ["of Ade-Igwu – Orokam,", "Ogbadibo LGA,", "Benue State."],
    parents: ["Mr. Augustine Ogbe Ameh", "Mrs. Agatha Ichame Ameh"],
    instagram: "https://www.instagram.com/ruruu_fundz?igsh=MWVmZjRwdTM5a3I4cg==&igsi=MWVmZjRwdTM5a3I4cg==",
    photo: image2Clean,
  },
};

const EVENT = {
  verse:
    "“So they are no longer two, but one flesh. Therefore what God has joined together, let no one separate.”",
  verseRef: "Matthew 19:6",
  day: "SATURDAY",
  date: "21 NOVEMBER 2026",
  ceremonyTime: "2:00 PM",
  venueName: "Luxe Lush event  center",
  venueAddress: "70 Kur Mohammed Avenue, Wuse 2, Abuja, Nigeria",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Luxe+Lush+Park+Riverplate+Park+70+Kur+Mohammed+Avenue+Wuse+2+Abuja+Nigeria",
  weddingDateTimeISO: "2026-11-21T14:00:00+01:00",
};

// Hero = image-3-clean. Houses = groom3 / image-2-clean. Countdown frame = couple6.
// Chronicles = the old house photos + image-5-clean + image-clean (2 x 2).
const GALLERY = [
  groomSuite,
  imageClean,
  image5Clean,
  bride2,
];

// How many photos show in the "Chronicles" grid (keep it even).
const GALLERY_VISIBLE = 4;

// Every other photo — these rotate through the "Upload Your Photos" collage.
const UPLOAD_PHOTOS = [
  couple1,
  groom1,
  couple4,
  bride1,
  couple2,
  image4Clean,
  couple5,
  bride3,
  couple3,
  groom2,
];

const HERO_VIDEO_POSTER = image3Clean;

const BG_AMBIENT_MUSIC_URL = "";
const GUEST_UPLOAD_URL = "https://mediahub-frontend-4tdp.vercel.app";

// Same backend used by the admin QR page. Set VITE_GUEST_API_URL in a
// local .env to point at http://localhost:5050/api when developing.
const API_BASE =
  import.meta.env.VITE_GUEST_API_URL || "https://wedding-guest-backend-b9g8.onrender.com/api";

const RSVP_DONE_KEY = "wi_rsvp_done_v1";
// Entry pass handed out right after an RSVP made through the shared link.
const MY_PASS_KEY = "wi_my_pass_v1";

// Must match SITE_URL in the admin QR page so the scanner reads the same link.
const SITE_URL = "https://wedding-invitation-taupe-seven-44.vercel.app";

// Shown only when the invitation is opened from a guest's personal link.
// Same QR the admin page generates for that guest.
function EntryPass({ token, name }) {
  const wrapRef = useRef(null);
  const url = `${SITE_URL}/?token=${encodeURIComponent(token)}`;

  const save = () => {
    const canvas = wrapRef.current && wrapRef.current.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `entry-pass-${(name || "guest").replace(/\s+/g, "_")}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <section className="text-center">
      <h3 className="font-serif text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.35em" }}>
        Your Seal of Entry
      </h3>
      <p className="mt-2 font-black-letter text-3xl" style={{ color: "#7a1220" }}>
        Entry Pass
      </p>
      <div
        className="mx-auto mt-6 max-w-[260px] rounded-2xl p-5"
        style={{ background: "#fbf4df", border: "1px solid #c9a24a", boxShadow: "0 10px 30px rgba(122,18,32,0.12)" }}
      >
        <div ref={wrapRef} className="flex justify-center">
          <QRCodeCanvas value={url} size={190} bgColor="#fbf4df" fgColor="#1c1a15" />
        </div>
        {name && (
          <p className="mt-4 font-serif text-sm font-bold" style={{ color: "#1c1a15" }}>{name}</p>
        )}
        <p className="mt-1 text-xs italic" style={{ color: "#7a5a2c" }}>
          Show this at the entrance
        </p>
        <p className="mt-2 text-[11px] font-semibold" style={{ color: "#7a1220" }}>
          This QR code can be used only once — keep it safe and don't share it.
        </p>
      </div>
      <button
        type="button"
        onClick={save}
        className="mt-4 rounded-full px-5 py-2 text-[10px] uppercase"
        style={{ letterSpacing: "0.25em", border: "1px solid #7a1220", color: "#7a1220", background: "transparent" }}
      >
        Save QR
      </button>
    </section>
  );
}

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

      @keyframes wi-shimmer {
        0%   { transform: translateX(-120%) skewX(-20deg); }
        60%, 100% { transform: translateX(260%) skewX(-20deg); }
      }
      .wi-shimmer { animation: wi-shimmer 2.8s ease-in-out infinite; }

      @keyframes wi-float {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(-7px); }
      }
      .wi-float { animation: wi-float 4s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .wi-tap-icon, .wi-tap-ripple, .wi-candle, .wi-pulse-dot, .wi-shimmer, .wi-float { animation: none; }
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
      {[[40, 150], [65, 125], [95, 105], [125, 85], [155, 55]].map(([x, y], i) => (
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
        Color of the Day
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
        in black tux, ladies in rich, natural tones.
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
          alt="Black tie wedding dress code reference — men in black and white, women in espresso, plum purple, ruby, olive, or sage"
          className="block w-full"
        />
      </div>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────
// RSVP form
// Open to everyone who has the single invitation link. A guest with a
// personal token keeps their name locked; anyone else types their own name
// and the backend adds them to the guest list when they RSVP.
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
    if (!token && !name.trim()) errs.name = "Please enter your name.";
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
        // With a personal token the server already knows the name; otherwise
        // the typed name is sent and the guest is added to the list.
        body: JSON.stringify({
          ...(token ? { token } : { name: name.trim() }),
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
      onSubmitted?.(body, attending);
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
            Your Name{token ? "" : " *"}
          </label>
          <input
            type="text"
            value={name}
            readOnly={!!token}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full bg-transparent pb-2 text-sm outline-none"
            style={{
              borderBottom: token ? "1px solid #7a5a2c" : fieldBorder("name"),
              color: "#1c1a15",
              opacity: token ? 0.75 : 1,
            }}
            placeholder={token ? undefined : "Your full name"}
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
// Shown instead of the RSVP form when the visitor has no valid personal link
// ─────────────────────────────────────────────────────────
function RsvpLocked({ checking }) {
  return (
    <div
      className="mx-6 rounded-3xl px-6 py-8 text-center"
      style={{
        background: "linear-gradient(180deg,#f4e6bd,#d9c088)",
        border: "1px solid #7a5a2c",
      }}
    >
      <p className="text-sm italic" style={{ color: "#4a3820" }}>
        {checking
          ? "Verifying your invitation…"
          : "RSVP is available only through your personal invitation link. Please use the link or QR code you were sent."}
      </p>
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
// Guest photo upload — "ad style" memories collage
// ─────────────────────────────────────────────────────────
function Polaroid({ src, rot = 0, className = "", style = {}, delay = 0, floatDelay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
      whileInView={{ opacity: 1, scale: 1, rotate: rot }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ delay, type: "spring", stiffness: 120, damping: 14 }}
      className={`absolute ${className}`}
      style={style}
    >
      <div className="wi-float" style={{ animationDelay: `${floatDelay}s` }}>
        <div
          style={{
            background: "#fbf4df",
            padding: "6px 6px 20px",
            border: "1px solid #c9a24a",
            boxShadow: "0 10px 22px rgba(30,15,5,0.35)",
          }}
        >
          <motion.img
            key={src}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9 }}
            src={src}
            alt=""
            className="block w-full object-cover"
            style={{ aspectRatio: "1 / 1.1" }}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_PHOTO; }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function GuestUploadSection() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 3500);
    return () => clearInterval(id);
  }, []);
  const pick = (offset) => UPLOAD_PHOTOS[(tick + offset) % UPLOAD_PHOTOS.length];

  return (
    <section className="relative overflow-hidden px-6 py-14" style={{ background: "#efe3c2" }}>
      <p className="font-serif text-center text-[11px]" style={{ letterSpacing: "0.4em", color: "#7a1220" }}>
        RAVENS OF THE REALM
      </p>
      <h2 className="font-black-letter mt-2 text-center text-4xl leading-tight" style={{ color: "#7a1220" }}>
        Caught a moment?
      </h2>
      <p className="mx-auto mt-2 max-w-xs text-center text-sm italic" style={{ color: "#4a3820" }}>
        Share it with us and help tell our saga in full.
      </p>
      <div className="wi-goldline mx-auto mt-4 h-px w-24" />

      {/* Collage */}
      <div className="relative mx-auto mt-8" style={{ width: "100%", maxWidth: 340, height: 360 }}>
        {/* soft glow behind the seal */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 260, height: 260,
            background: "radial-gradient(circle, rgba(201,162,74,0.55), transparent 70%)",
          }}
        />

        {/* tilted polaroids */}
        <Polaroid src={pick(0)} rot={-11} delay={0.1} floatDelay={0}
          style={{ width: 118, left: 0, top: 6 }} />
        <Polaroid src={pick(2)} rot={9} delay={0.25} floatDelay={1}
          style={{ width: 112, right: 0, top: 18 }} />
        <Polaroid src={pick(5)} rot={-6} delay={0.4} floatDelay={2}
          style={{ width: 104, left: 8, bottom: 6 }} />
        <Polaroid src={pick(7)} rot={7} delay={0.55} floatDelay={1.5}
          style={{ width: 100, right: 6, bottom: 0 }} />

        {/* center: wax seal with camera */}
        <motion.div
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 160, damping: 14 }}
          className="absolute left-1/2 top-1/2 z-10"
          style={{ width: 96, height: 96, marginLeft: -48, marginTop: -48 }}
        >
          <div className="wi-float" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 12px 18px rgba(30,15,5,0.45))" }}>
            <WaxDisc />
          </div>
          <div
            className="absolute flex items-center justify-center rounded-full"
            style={{
              right: -8, bottom: -8, width: 34, height: 34,
              background: "#efe3c2", color: "#7a1220", border: "1px solid #c9a24a",
              boxShadow: "0 4px 10px rgba(30,15,5,0.35)",
            }}
          >
            <FaCamera size={14} />
          </div>
        </motion.div>

        {/* floating hearts */}
        {[
          { l: "30%", t: "2%", d: 0 },
          { l: "68%", t: "-2%", d: 0.8 },
          { l: "46%", t: "92%", d: 1.4 },
        ].map((h, i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute"
            style={{ left: h.l, top: h.t, color: "#7a1220" }}
            animate={{ y: [0, -10, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.6, repeat: Infinity, delay: h.d }}
          >
            <FaHeart size={12} />
          </motion.span>
        ))}
      </div>

      {/* Steps strip */}
      <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-2 text-[10px] uppercase"
        style={{ letterSpacing: "0.22em", color: "#7a5a2c" }}>
        <span>Tap</span><span style={{ color: "#7a1220" }}>✦</span>
        <span>Pick</span><span style={{ color: "#7a1220" }}>✦</span>
        <span>Share</span>
      </div>

      {/* CTA */}
      <div className="mt-5 flex justify-center">
        <motion.a
          href={GUEST_UPLOAD_URL}
          target="_blank"
          rel="noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.96 }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(122,18,32,0.45)",
              "0 0 0 14px rgba(122,18,32,0)",
            ],
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          className="relative inline-flex items-center gap-2 overflow-hidden rounded-full px-7 py-3.5 text-[11px] uppercase"
          style={{
            letterSpacing: "0.3em",
            color: "#efe3c2",
            background: "linear-gradient(135deg,#7a1220,#4a0a12)",
            border: "1px solid #c9a24a",
            fontFamily: "'Cinzel', serif",
          }}
        >
          <span
            className="wi-shimmer pointer-events-none absolute inset-y-0 left-0"
            style={{ width: 40, background: "linear-gradient(90deg, transparent, rgba(255,235,180,0.45), transparent)" }}
          />
          <FaCamera className="relative" />
          <span className="relative">Upload Your Photos</span>
        </motion.a>
      </div>

      <p className="mt-5 text-center text-[10px]" style={{ letterSpacing: "0.3em", color: "#7a5a2c" }}>
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
// Cover screen
// ─────────────────────────────────────────────────────────
function CoverScreen({ onOpen, guestName }) {
  const [phase, setPhase] = useState("idle");
  const cracked = phase !== "idle";
  const opening = phase === "opening" || phase === "revealed";
  const revealed = phase === "revealed";

  const handleTap = () => {
    if (phase !== "idle") return;
    setPhase("cracking");
    setTimeout(() => setPhase("opening"), 650);
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
            <h1 className="font-serif mt-6 text-2xl" style={{ letterSpacing: "0.12em", color: "#2a1408" }}>
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
                  A summon unto
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
export default function WeddingInvitation() {
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [guestName, setGuestName] = useState("");
  const [guestToken, setGuestToken] = useState("");
  const [guestType, setGuestType] = useState("");
  // none = no token in the URL | checking | valid | invalid
  const [tokenStatus, setTokenStatus] = useState("none");
  const [rsvpDone, setRsvpDone] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(RSVP_DONE_KEY) === "1"
  );
  const [showReminder, setShowReminder] = useState(false);
  // Pass created by RSVPing through the shared link: { token, name }
  const [myPass, setMyPass] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(MY_PASS_KEY) || "null");
    } catch {
      return null;
    }
  });
  const audioRef = useRef(null);
  const countdown = useCountdown(EVENT.weddingDateTimeISO);

  // Anyone with the invitation link can RSVP. A verified personal link
  // (?token=…) additionally pre-fills the name, shows the entry pass and
  // enables the reminder nudges.
  const hasPersonalLink = tokenStatus === "valid";

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 80]);
  const heroScale = useTransform(scrollY, [0, 500], [1, 1.08]);

  const sectionRefs = {
    home: useRef(null), couple: useRef(null),
    event: useRef(null), rsvp: useRef(null),
  };

  // Identify the guest from ?token=… and verify it with the server.
  // (The old ?guest=Name shortcut is removed — anyone could type a name.)
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) return;

    setGuestToken(token);
    setTokenStatus("checking");
    fetch(`${API_BASE}/guests/by-token/${encodeURIComponent(token)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((guest) => {
        if (guest?.name) {
          setGuestName(guest.name);
          setGuestType(guest.guestType || "");
          setTokenStatus("valid");
        } else {
          setTokenStatus("invalid");
        }
      })
      .catch(() => setTokenStatus("invalid"));
  }, []);

  useEffect(() => {
    if (!opened) document.body.style.overflow = "hidden";
    else { document.body.style.overflow = ""; window.scrollTo(0, 0); }
    return () => { document.body.style.overflow = ""; };
  }, [opened]);

  // Gently nudge verified guests who haven't RSVP'd yet — appears a little
  // while after opening the invite, not immediately.
  useEffect(() => {
    if (!opened || rsvpDone || !hasPersonalLink) return;
    const id = setTimeout(() => setShowReminder(true), 15000);
    return () => clearTimeout(id);
  }, [opened, rsvpDone, hasPersonalLink]);

  // Best-effort nudge if a verified guest tries to leave without RSVPing.
  useEffect(() => {
    const handler = (e) => {
      if (rsvpDone || !hasPersonalLink) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [rsvpDone, hasPersonalLink]);

  const scrollTo = (id) => {
    setActiveNav(id);
    setShowReminder(false);
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRsvpSubmitted = (body, attending) => {
    // The server returns the new guest's token when someone RSVPs through the
    // shared link — keep it so their QR shows up right away (and on revisits).
    const newToken = body?.token || body?.guest?.token;
    const newName = body?.name || body?.guest?.name || "";
    if (newToken && attending !== "no" && !hasPersonalLink) {
      const pass = { token: newToken, name: newName };
      setMyPass(pass);
      try {
        localStorage.setItem(MY_PASS_KEY, JSON.stringify(pass));
      } catch {
        /* storage unavailable */
      }
    }
    localStorage.setItem(RSVP_DONE_KEY, "1");
    setRsvpDone(true);
    setShowReminder(false);
  };

  useEffect(() => {
    if (opened && audioRef.current && !muted) audioRef.current.play().catch(() => { });
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
          <motion.div ref={heroRef} style={{ y: heroY, scale: heroScale }} className="mx-auto">
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
              {/* where the family is from, as written on the invitation card */}
              {p.origin && (
                <>
                  <div className="wi-goldline mx-auto mt-3 h-px w-16" />
                  <div className="mt-3">
                    {p.origin.map((line) => (
                      <p key={line} className="text-xs italic leading-relaxed" style={{ color: "#7a5a2c" }}>{line}</p>
                    ))}
                  </div>
                </>
              )}
              <motion.a whileHover={{ scale: 1.1, rotate: 6 }} whileTap={{ scale: 0.95 }}
                href={p.instagram} target="_blank" rel="noreferrer"
                className="mx-auto mt-5 flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: "linear-gradient(135deg, #7a1220, #4a0a12)", color: "#efe3c2", border: "1px solid #c9a24a" }}
              >
                <FaInstagram size={16} />
              </motion.a>
            </motion.div>
          ))}

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
            Reception · {EVENT.ceremonyTime}
          </p>

          <div className="wi-goldline my-5 h-px w-2/3 mx-auto" />

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
            className="mt-6 inline-block rounded-full px-5 py-2 text-[10px]"
            style={{
              letterSpacing: "0.3em",
              color: "#efe3c2",
              background: "linear-gradient(135deg, #7a1220, #4a0a12)",
              border: "1px solid #c9a24a",
            }}
          >
            {COUPLE.hashtag}
          </motion.p>

          <ArchFrame src={couple6} alt="" className="mx-auto mt-8 h-64 w-64" />

          <p className="mt-6 font-serif text-lg italic" style={{ color: "#7a1220" }}>
            May the Lord bless and keep our union.
          </p>
        </section>

        <SectionDivider symbol="✦" />

        {/* GALLERY — reduced to GALLERY_VISIBLE photos */}
        <section className="px-6">
          <h3 className="text-center font-serif text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.35em" }}>
            Chronicles
          </h3>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {GALLERY.slice(0, GALLERY_VISIBLE).map((src, i) => (
              <ArchFrame
                key={i}
                src={src}
                alt={`Gallery ${i + 1}`}
                className="h-48 w-full"
                delay={i * 0.08}
              />
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

        {/* RSVP — open to anyone with the invitation link */}
        <section ref={sectionRefs.rsvp}>
          <h3 className="text-center font-serif text-[10px] uppercase" style={{ color: "#7a1220", letterSpacing: "0.35em" }}>
            Send a Raven
          </h3>
          <p className="mt-2 text-center font-black-letter text-3xl" style={{ color: "#7a1220" }}>
            Answer the Summons
          </p>
          <div className="mt-6">
            {tokenStatus === "checking" ? (
              <RsvpLocked checking />
            ) : (
              <WishesForm
                token={hasPersonalLink ? guestToken : ""}
                prefillName={guestName}
                onSubmitted={handleRsvpSubmitted}
              />
            )}
          </div>
        </section>

        {/* ENTRY PASS — only for verified guests with a personal link (not physical-card guests) */}
        {hasPersonalLink && guestType !== "physical" ? (
          <>
            <SectionDivider symbol="✦" />
            <EntryPass token={guestToken} name={guestName} />
          </>
        ) : (
          myPass?.token && (
            <>
              <SectionDivider symbol="✦" />
              <EntryPass token={myPass.token} name={myPass.name} />
            </>
          )
        )}

        <SectionDivider symbol="✦" />

        {/* GUEST PHOTO UPLOAD */}
        <GuestUploadSection />

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
        {opened && showReminder && !rsvpDone && hasPersonalLink && (
          <RsvpReminder
            onScrollToRsvp={() => scrollTo("rsvp")}
            onDismiss={() => setShowReminder(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}