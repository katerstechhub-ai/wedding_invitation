import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  FaInstagram, FaMapMarkerAlt, FaVolumeUp, FaVolumeMute, FaHeart,
  FaHome, FaUserFriends, FaCalendarAlt, FaEnvelopeOpenText, FaLandmark,
} from "react-icons/fa";

import pamsPhoto from "./assets/pams.jpeg";
import bizzerPhoto from "./assets/Bizzer.jpeg";

/**
 * Wedding Invitation — refined "WedWebs" style.
 * Install framer-motion:  npm i framer-motion
 *
 * Upgrades vs. the previous version:
 *  • Framer Motion throughout — soft reveals, staggered children, parallax.
 *  • Finer typography: Cormorant Garamond display + Cormorant italic accents
 *    + Jost body. Tighter tracking, more air.
 *  • Refined envelope: layered paper, embossed monogram, glowing wax seal,
 *    smoother 3D flap easing, letter rises with a gentle spring.
 *  • Softer palette + subtle grain, gold hairlines, arch frames w/ inner ring.
 *  • Parallax hero, animated countdown flip, hover-lift on cards.
 *  • Same data + RSVP behavior.
 */

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

const RSVP_EMAIL_ENDPOINT = "https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID";

// ─────────────────────────────────────────────────────────
// Global styles + refined typography
// ─────────────────────────────────────────────────────────
function GlobalInviteStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');

      .wi-root {
        font-family: 'Jost', sans-serif;
        font-weight: 300;
        letter-spacing: 0.01em;
        -webkit-font-smoothing: antialiased;
      }
      .wi-root .font-serif {
        font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif !important;
        font-weight: 400;
      }
      .wi-grain {
        position: relative;
      }
      .wi-grain::after {
        content: "";
        position: absolute; inset: 0;
        pointer-events: none;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.4  0 0 0 0 0.35  0 0 0 0 0.2  0 0 0 0.06 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        mix-blend-mode: multiply;
        opacity: 0.35;
      }

      .wi-goldline {
        background: linear-gradient(90deg, transparent, #c9a14a 20%, #e6cd8a 50%, #c9a14a 80%, transparent);
      }

      @keyframes wi-tap-bob {
        0%,100% { transform: translateY(0); }
        50% { transform: translateY(4px); }
      }
      @keyframes wi-tap-ripple {
        0% { transform: scale(0.55); opacity: 0.85; }
        100% { transform: scale(1.9); opacity: 0; }
      }
      @keyframes wi-seal-glow {
        0%,100% { box-shadow: 0 6px 14px rgba(0,0,0,0.32), inset 0 2px 3px rgba(255,255,255,0.35), 0 0 0 rgba(201,161,74,0); }
        50%     { box-shadow: 0 6px 14px rgba(0,0,0,0.32), inset 0 2px 3px rgba(255,255,255,0.35), 0 0 22px rgba(201,161,74,0.55); }
      }
      .wi-tap-icon { animation: wi-tap-bob 1.6s ease-in-out infinite; }
      .wi-tap-ripple { animation: wi-tap-ripple 1.6s ease-out infinite; }
      .wi-seal { animation: wi-seal-glow 2.6s ease-in-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .wi-tap-icon, .wi-tap-ripple, .wi-seal { animation: none; }
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────
// Decorative floral corner
// ─────────────────────────────────────────────────────────
function FloralCorner({ className = "", flip = false, tone = "sage" }) {
  const c =
    tone === "gold"
      ? { line: "#cdb583", petal: "#fbf6ea", petalStroke: "#e3d3ac", dot: "#c79a4e" }
      : { line: "#7c8a5e", petal: "#eef1e6", petalStroke: "#bcc7a3", dot: "#c9a14a" };
  return (
    <svg
      viewBox="0 0 180 180"
      className={className}
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
      aria-hidden
    >
      <g fill="none" stroke={c.line} strokeWidth="1.1" strokeLinecap="round">
        <path d="M20 160 C 60 150, 100 110, 140 60" />
        <path d="M30 160 C 70 140, 110 100, 150 40" opacity="0.55" />
        {[
          [40, 150], [55, 130], [70, 115], [90, 105], [110, 95], [130, 75], [145, 55],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r="6" fill={c.petal} stroke={c.petalStroke} strokeWidth="0.8" />
            <circle cx={cx} cy={cy} r="1.6" fill={c.dot} />
          </g>
        ))}
        <circle cx="150" cy="40" r="2" fill={c.dot} />
      </g>
    </svg>
  );
}

function SectionDivider({ symbol = "&" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="my-12 flex items-center justify-center gap-4"
    >
      <span className="h-px w-16 wi-goldline" />
      <span className="font-serif italic text-2xl" style={{ color: "#c9a14a" }}>{symbol}</span>
      <span className="h-px w-16 wi-goldline" />
    </motion.div>
  );
}

// Fallback photo
const FALLBACK_PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'>
       <rect width='100%' height='100%' fill='#efe9d7'/>
       <text x='50%' y='50%' text-anchor='middle' fill='#a99a70' font-family='Georgia' font-size='22' font-style='italic'>Photo</text>
     </svg>`
  );

// Arch frame with inner gold hairline
function ArchFrame({ src, alt, className = "", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay }}
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius: "9999px 9999px 8px 8px",
        boxShadow: "0 20px 40px -20px rgba(60,50,20,0.35)",
      }}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = FALLBACK_PHOTO;
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-2"
        style={{
          borderRadius: "9999px 9999px 6px 6px",
          border: "1px solid rgba(255, 246, 220, 0.55)",
          boxShadow: "inset 0 0 0 1px rgba(201,161,74,0.35)",
        }}
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
        className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl"
        style={{
          background: "linear-gradient(160deg, #ffffff 0%, #f2ecda 100%)",
          border: "1px solid #d9cfac",
          boxShadow: "0 8px 20px -10px rgba(60,50,20,0.25), inset 0 1px 0 rgba(255,255,255,0.8)",
        }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={str}
            initial={{ y: -22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 22, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-2xl"
            style={{ color: "#3f4632" }}
          >
            {str}
          </motion.span>
        </AnimatePresence>
      </div>
      <span
        className="mt-2 text-[10px] uppercase"
        style={{ letterSpacing: "0.25em", color: "#8d8463" }}
      >
        {label}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Bottom nav
// ─────────────────────────────────────────────────────────
function BottomNav({ active, onNavigate }) {
  const items = [
    { id: "home", icon: FaHome, label: "Home" },
    { id: "couple", icon: FaUserFriends, label: "Couple" },
    { id: "event", icon: FaCalendarAlt, label: "Event" },
    { id: "rsvp", icon: FaEnvelopeOpenText, label: "RSVP" },
  ];
  return (
    <motion.nav
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
      className="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-2 rounded-full px-3 py-2 backdrop-blur"
      style={{
        background: "rgba(255,253,244,0.9)",
        border: "1px solid #e3d9b9",
        boxShadow: "0 12px 30px -12px rgba(60,50,20,0.35)",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="relative flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] transition"
            style={{ color: isActive ? "#fff" : "#8a7d5a" }}
          >
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-full"
                style={{ background: "linear-gradient(135deg, #5c6b45, #7c8a5e)" }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon size={14} className="relative" />
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </motion.nav>
  );
}

// ─────────────────────────────────────────────────────────
// RSVP form
// ─────────────────────────────────────────────────────────
function WishesForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [attending, setAttending] = useState("yes");
  const [status, setStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    if (RSVP_EMAIL_ENDPOINT.includes("REPLACE_WITH_YOUR_FORM_ID")) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(RSVP_EMAIL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, attending, message }),
      });
      if (res.ok) { setStatus("sent"); setName(""); setMessage(""); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8 }}
      className="mx-6 rounded-2xl px-6 py-8"
      style={{
        background: "linear-gradient(180deg, #fbf7e8 0%, #f3ecd6 100%)",
        border: "1px solid #e3d9b9",
        boxShadow: "0 20px 40px -25px rgba(60,50,20,0.4)",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-[10px] uppercase" style={{ letterSpacing: "0.25em", color: "#8d8463" }}>
            Your Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full bg-transparent pb-2 text-sm outline-none"
            style={{ borderBottom: "1px solid #bcb497", color: "#3f4632" }}
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase" style={{ letterSpacing: "0.25em", color: "#8d8463" }}>
            Will you attend?
          </label>
          <div className="mt-2 flex gap-2">
            {["yes", "maybe", "no"].map((opt) => (
              <motion.button
                type="button"
                key={opt}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAttending(opt)}
                className="flex-1 rounded-full px-3 py-1.5 text-xs capitalize transition"
                style={
                  attending === opt
                    ? { border: "1px solid #5c6b45", backgroundColor: "#5c6b45", color: "#fff" }
                    : { border: "1px solid #cabf9e", color: "#7c8a5e" }
                }
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase" style={{ letterSpacing: "0.25em", color: "#8d8463" }}>
            Say something for our wedding *
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="mt-1 w-full resize-none bg-transparent pb-2 text-sm outline-none"
            style={{ borderBottom: "1px solid #bcb497", color: "#3f4632" }}
            placeholder="Write your wishes..."
          />
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={status === "sending"}
          className="w-full rounded-full py-3 text-xs uppercase text-white shadow-md"
          style={{
            letterSpacing: "0.25em",
            background: "linear-gradient(135deg, #5c6b45 0%, #7c8a5e 100%)",
            opacity: status === "sending" ? 0.7 : 1,
          }}
        >
          {status === "sending" ? "Sending…" : "Send Wishes"}
        </motion.button>

        {status === "sent" && (
          <p className="text-center text-xs" style={{ color: "#5c6b45" }}>
            Thank you — your RSVP has been sent 💌
          </p>
        )}
        {status === "error" && (
          <p className="text-center text-xs" style={{ color: "#b3543f" }}>
            Couldn't send just now — please try again.
          </p>
        )}
      </form>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Tap hint
// ─────────────────────────────────────────────────────────
function TapHint({ label = "Tap to Open" }) {
  return (
    <div className="flex flex-col items-center" style={{ marginTop: 16 }}>
      <span style={{ fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: "#9a8c63" }}>
        {label}
      </span>
      <div className="wi-tap-icon" style={{ position: "relative", width: 36, height: 36, marginTop: 10 }}>
        <span
          className="wi-tap-ripple"
          style={{ position: "absolute", inset: 4, borderRadius: "50%", border: "1.4px solid #a9763c" }}
        />
        <svg
          width="36" height="36" viewBox="0 0 34 34" fill="none"
          stroke="#a9763c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: "relative" }}
        >
          <path d="M13.5 18.5V9.6a1.7 1.7 0 0 1 3.4 0V17" />
          <path d="M16.9 17V8.2a1.7 1.7 0 0 1 3.4 0V17" />
          <path d="M20.3 17v-5.6a1.7 1.7 0 0 1 3.4 0v8.7c0 3.2-2.3 5.7-6 5.7h-1.9c-1.9 0-2.9-.6-4-1.9l-2.8-3.4c-.6-.8-.4-1.7.4-2.2.7-.5 1.5-.3 2.1.3l1.7 1.8" />
        </svg>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Cover / envelope screen — refined
// ─────────────────────────────────────────────────────────
function CoverScreen({ onOpen, guestName }) {
  const [phase, setPhase] = useState("closed"); // closed | flapOpen | cardOut

  const flapOpen = phase === "flapOpen" || phase === "cardOut";
  const cardVisible = phase === "cardOut";
  const sealBroken = phase !== "closed";
  const monogram = `${COUPLE.groom.nickname[0]}${COUPLE.bride.nickname[0]}`;

  const handleOpenClick = () => {
    if (phase !== "closed") return;
    setPhase("flapOpen");
    setTimeout(() => setPhase("cardOut"), 850);
  };

  const paperTexture = {
    backgroundImage:
      "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.75), transparent 55%), " +
      "repeating-linear-gradient(135deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 3px), " +
      "linear-gradient(160deg, #fdfaf3 0%, #efe6cf 100%)",
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-6 wi-grain"
      style={{
        background:
          "radial-gradient(circle at 50% 16%, #f4f0df 0%, #e6e1c8 55%, #d5cfb4 100%)",
      }}
    >
      <FloralCorner className="absolute left-0 top-0 h-32 w-32 opacity-80" tone="gold" />
      <FloralCorner className="absolute right-0 top-0 h-32 w-32 opacity-80" tone="gold" flip />
      <FloralCorner className="absolute bottom-0 left-0 h-32 w-32 -scale-y-100 opacity-80" tone="gold" flip />
      <FloralCorner className="absolute bottom-0 right-0 h-32 w-32 -scale-y-100 opacity-80" tone="gold" />

      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        role="button"
        tabIndex={0}
        onClick={handleOpenClick}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpenClick()}
        className="relative"
        style={{
          height: 560,
          width: 330,
          perspective: "1800px",
          cursor: phase === "closed" ? "pointer" : "default",
        }}
      >
        {/* Envelope pocket */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: 16,
            border: "1px solid #d9cfac",
            boxShadow:
              "0 30px 60px -18px rgba(40,32,12,0.35), inset 0 0 0 1px rgba(255,246,220,0.5)",
            ...paperTexture,
          }}
        >
          {/* Letter */}
          <motion.div
            initial={false}
            animate={
              cardVisible
                ? { y: 0, opacity: 1 }
                : { y: 40, opacity: 0 }
            }
            transition={{ type: "spring", stiffness: 90, damping: 18, delay: cardVisible ? 0.15 : 0 }}
            className="absolute inset-x-5 flex flex-col items-center px-6 text-center"
            style={{
              top: "13%",
              bottom: "5%",
              borderRadius: 12,
              border: "1px solid #cdbf99",
              background: "linear-gradient(160deg, #fffdf7 0%, #f6efdd 100%)",
              boxShadow:
                "0 14px 34px rgba(60,50,20,0.2), inset 0 0 0 1px rgba(201,161,74,0.15)",
              paddingTop: 30,
              paddingBottom: 22,
              justifyContent: "flex-start",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-md"
              style={{ border: "1px solid rgba(201,161,74,0.35)" }}
            />
            <p style={{ fontSize: 9.5, letterSpacing: "0.35em", textTransform: "uppercase", color: "#9a8c63" }}>
              Together With Their Families
            </p>

            <p className="font-serif italic" style={{ fontSize: 28, marginTop: 12, color: "#a9763c" }}>&</p>

            <h1
              className="font-serif italic"
              style={{ fontSize: 30, marginTop: 6, color: "#3c4630", lineHeight: 1.2, letterSpacing: "0.01em" }}
            >
              {COUPLE.groom.nickname} & {COUPLE.bride.nickname}
            </h1>

            <div className="wi-goldline" style={{ width: 60, height: 1, margin: "18px auto" }} />

            <p style={{ fontSize: 12.5, color: "#5c5848", lineHeight: 1.7, maxWidth: 230, fontStyle: "italic" }}>
              request the honour of your presence
              <br />as we begin our forever
            </p>

            {guestName && (
              <p style={{ marginTop: 14, fontSize: 12.5, color: "#7a6c4c", fontStyle: "italic" }}>
                Dear, <span style={{ fontWeight: 500 }}>{guestName}</span>
              </p>
            )}

            <p style={{ marginTop: 16, fontSize: 11, letterSpacing: "0.22em", color: "#8a7b53" }}>
              {EVENT.date.toUpperCase()}
            </p>

            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 14px 28px rgba(60,50,20,0.32)" }}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => { e.stopPropagation(); onOpen(); }}
              style={{
                marginTop: 22,
                borderRadius: 999,
                padding: "12px 30px",
                fontSize: 10.5,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: "#fff",
                background: "linear-gradient(135deg, #5c6b45 0%, #7c8a5e 100%)",
                border: "none",
                boxShadow: "0 10px 22px rgba(60,50,20,0.25)",
                cursor: "pointer",
                opacity: cardVisible ? 1 : 0,
                transform: cardVisible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 500ms ease 450ms, transform 500ms ease 450ms, box-shadow 300ms",
              }}
            >
              View Full Invitation
            </motion.button>
          </motion.div>
        </div>

        {/* Flap */}
        <motion.div
          initial={false}
          animate={{ rotateX: flapOpen ? -172 : 0 }}
          transition={{ duration: 1.1, ease: [0.6, 0, 0.35, 1] }}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "62%",
            transformOrigin: "top center", transformStyle: "preserve-3d", zIndex: 2,
          }}
        >
          <div
            style={{
              position: "absolute", inset: 0,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              backfaceVisibility: "hidden",
              border: "1px solid #d9cfac", borderTop: "none",
              boxShadow: "inset 0 -10px 22px -12px rgba(60,48,20,0.3)",
              ...paperTexture,
            }}
          />
        </motion.div>

        {/* Wax seal */}
        <motion.div
          className="wi-seal"
          initial={false}
          animate={
            sealBroken
              ? { opacity: 0, scale: 1.6, rotate: 22 }
              : { opacity: 1, scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            position: "absolute", left: "50%", top: "62%",
            translateX: "-50%", translateY: "-50%",
            pointerEvents: sealBroken ? "none" : "auto", zIndex: 3,
            width: 66, height: 66, borderRadius: "50%",
            background:
              "radial-gradient(circle at 32% 28%, #f2dfa8, #c99251 60%, #8f5a25 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic", fontSize: 22, color: "#fffdf6",
              textShadow: "0 1px 1px rgba(0,0,0,0.35)",
            }}
          >
            {monogram}
          </span>
        </motion.div>

        {/* Guest line + tap hint */}
        <motion.div
          initial={false}
          animate={{ opacity: phase === "closed" ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "absolute", left: 0, right: 0, top: "72%",
            textAlign: "center",
            pointerEvents: phase === "closed" ? "auto" : "none",
          }}
        >
          {guestName && (
            <p style={{ fontSize: 12, color: "#7a6c4c", fontStyle: "italic" }}>
              Dear, <span style={{ fontWeight: 500 }}>{guestName}</span>
            </p>
          )}
          <TapHint />
        </motion.div>
      </motion.div>
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
    const g = params.get("guest");
    if (g) setGuestName(decodeURIComponent(g));
  }, []);

  // The main content behind CoverScreen is always mounted in the DOM (just
  // faded to opacity 0), so without this the page is scrollable to its full
  // height while the envelope is still showing — you end up scrolling an
  // invisible page behind a `position: fixed` cover, which looks exactly
  // like scrolling past the card into empty space. Locking scroll here
  // prevents that entirely, and resetting to the top on open ensures the
  // hero parallax (useScroll/useTransform) and the couple section's
  // whileInView animations start from scrollY = 0 instead of wherever the
  // page happened to be scrolled to behind the cover.
  useEffect(() => {
    if (!opened) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      window.scrollTo(0, 0);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [opened]);

  const scrollTo = (id) => {
    setActiveNav(id);
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth" });
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
      style={{ backgroundColor: "#f7f4e9", color: "#3f4632" }}
    >
      <GlobalInviteStyles />

      {BG_AMBIENT_MUSIC_URL && <audio ref={audioRef} src={BG_AMBIENT_MUSIC_URL} loop />}

      <AnimatePresence>
        {!opened && <CoverScreen onOpen={() => setOpened(true)} guestName={guestName} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: opened ? 1 : 0 }}
        transition={{ duration: 0.9, delay: opened ? 0.2 : 0 }}
        className="mx-auto max-w-md pb-28"
      >
        {opened && BG_AMBIENT_MUSIC_URL && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="fixed right-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full shadow"
            style={{ backgroundColor: "rgba(255,255,255,0.85)", color: "#5c6b45" }}
          >
            {muted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
          </button>
        )}

        {/* HERO */}
        <section ref={sectionRefs.home} className="relative px-6 pt-12 text-center">
          <motion.p
            initial="hidden" animate="show" variants={fadeUp}
            className="font-serif text-3xl italic"
            style={{ color: "#5c6b45" }}
          >
            &
          </motion.p>

          <motion.div
            ref={heroRef}
            style={{ y: heroY, scale: heroScale }}
            className="mx-auto mt-6"
          >
            <ArchFrame
              src={HERO_VIDEO_POSTER}
              alt="Cover"
              className="mx-auto h-[440px] w-[290px]"
            />
          </motion.div>

          <motion.h2
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={fadeUp}
            className="mt-8 font-serif text-4xl italic"
            style={{ color: "#3f4632", letterSpacing: "0.01em" }}
          >
            {COUPLE.groom.nickname} <span style={{ color: "#c9a14a" }}>&</span> {COUPLE.bride.nickname}
          </motion.h2>
          <motion.p
            initial="hidden" whileInView="show" viewport={{ once: true }}
            variants={fadeUp}
            className="mt-2 text-xs uppercase"
            style={{ color: "#8d8463", letterSpacing: "0.3em" }}
          >
            {COUPLE.groom.fullName} & {COUPLE.bride.fullName}
          </motion.p>
        </section>

        <SectionDivider />

        {/* VERSE */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9 }}
          className="relative mx-6 overflow-hidden rounded-3xl px-8 py-12 text-center"
          style={{
            background: "linear-gradient(160deg, #e5ead1 0%, #d3dbb8 100%)",
            border: "1px solid #c3ce9e",
            boxShadow: "0 20px 40px -25px rgba(60,80,30,0.35)",
          }}
        >
          <FloralCorner className="absolute -right-6 -top-6 h-24 w-24 opacity-60" />
          <FloralCorner className="absolute -bottom-6 -left-6 h-24 w-24 opacity-60" flip />
          <p className="font-serif text-lg italic leading-relaxed" style={{ color: "#3f4632" }}>
            {EVENT.verse}
          </p>
          <p className="mt-4 text-xs uppercase" style={{ color: "#5c6b45", letterSpacing: "0.3em" }}>
            {EVENT.verseRef}
          </p>
        </motion.section>

        <SectionDivider symbol="✦" />

        {/* COUPLE */}
        <section ref={sectionRefs.couple} className="px-6">
          <h3 className="text-center text-[10px] uppercase" style={{ color: "#8d8463", letterSpacing: "0.35em" }}>
            The Couple
          </h3>

          {[COUPLE.groom, COUPLE.bride].map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="mt-10 text-center"
            >
              <ArchFrame src={p.photo} alt={p.nickname} className="mx-auto h-80 w-60" />
              <p className="mt-6 font-serif text-3xl italic" style={{ color: "#5c6b45" }}>{p.nickname}</p>
              <p className="mt-1 font-serif text-lg" style={{ color: "#3f4632" }}>{p.fullName}</p>
              <p className="mt-3 text-[10px] uppercase" style={{ color: "#8d8463", letterSpacing: "0.3em" }}>
                {idx === 0 ? "Son of" : "Daughter of"}
              </p>
              <p className="mt-1 text-sm italic" style={{ color: "#5c5848" }}>{p.parents[0]}</p>
              <p className="text-sm italic" style={{ color: "#5c5848" }}>& {p.parents[1]}</p>
              <motion.a
                whileHover={{ scale: 1.1, rotate: 6 }}
                whileTap={{ scale: 0.95 }}
                href={p.instagram}
                target="_blank" rel="noreferrer"
                className="mx-auto mt-5 flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ background: "linear-gradient(135deg, #3f4632, #5c6b45)" }}
              >
                <FaInstagram size={16} />
              </motion.a>
            </motion.div>
          ))}

          <div className="mt-10 text-center font-serif text-4xl italic" style={{ color: "#c9a14a" }}>&</div>
        </section>

        <SectionDivider />

        {/* WITH LOVE */}
        <section className="relative px-10 text-center">
          <FloralCorner className="absolute -left-2 top-0 h-20 w-20 opacity-60" />
          <FloralCorner className="absolute -right-2 top-0 h-20 w-20 opacity-60" flip />
          <motion.h3
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="mt-6 font-serif text-3xl italic"
          >
            With Love.
          </motion.h3>
          <p className="mt-3 text-sm italic leading-relaxed" style={{ color: "#5c5848" }}>
            We request the honor of your presence on our special day.
          </p>
        </section>

        {/* EVENT DETAILS */}
        <motion.section
          ref={sectionRefs.event}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.9 }}
          className="relative mx-6 mt-8 overflow-hidden rounded-[42px] px-6 pb-10 pt-10 text-center"
          style={{
            background: "linear-gradient(180deg, #f5dccf 0%, #fbf3ee 100%)",
            border: "1px solid #ecc9b6",
            boxShadow: "0 25px 50px -25px rgba(140,80,60,0.35)",
          }}
        >
          <FloralCorner className="absolute -top-4 -right-4 h-20 w-20 opacity-50" tone="gold" flip />

          <p className="text-[10px] uppercase" style={{ color: "#8a5c4f", letterSpacing: "0.35em" }}>
            {EVENT.day}
          </p>
          <p className="mt-2 font-serif text-3xl italic">{EVENT.date}</p>
          <p className="mt-1 text-xs uppercase" style={{ color: "#8a5c4f", letterSpacing: "0.25em" }}>
            Ceremony · {EVENT.ceremonyTime}
          </p>

          <div className="wi-goldline my-5 h-px w-2/3 mx-auto" />

          <p className="text-[10px] uppercase" style={{ color: "#8a5c4f", letterSpacing: "0.35em" }}>
            After Party
          </p>
          <p className="mt-1 text-xs uppercase" style={{ color: "#8a5c4f", letterSpacing: "0.25em" }}>
            {EVENT.afterPartyTime}
          </p>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 180, damping: 14 }}
            className="mt-6 flex justify-center"
            style={{ color: "#8a5c4f" }}
          >
            <FaLandmark size={26} />
          </motion.div>
          <p className="mt-3 font-serif text-lg leading-snug">{EVENT.venueName}</p>
          <p className="mt-2 text-xs italic" style={{ color: "#8a5c4f" }}>{EVENT.venueAddress}</p>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            href={EVENT.mapsUrl}
            target="_blank" rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-[10px] uppercase text-white shadow-md"
            style={{
              letterSpacing: "0.3em",
              background: "linear-gradient(135deg, #5c6b45 0%, #7c8a5e 100%)",
            }}
          >
            <FaMapMarkerAlt size={12} /> View Location
          </motion.a>
        </motion.section>

        {/* COUNTDOWN */}
        <section className="relative mt-14 px-6 text-center">
          <div className="flex justify-center gap-3">
            <CountdownBlock value={countdown.days} label="Days" />
            <CountdownBlock value={countdown.hours} label="Hours" />
            <CountdownBlock value={countdown.minutes} label="Minutes" />
            <CountdownBlock value={countdown.seconds} label="Seconds" />
          </div>

          <motion.p
            whileHover={{ scale: 1.05 }}
            className="mt-6 inline-block rounded-full px-5 py-2 text-[10px] uppercase text-white"
            style={{
              letterSpacing: "0.3em",
              background: "linear-gradient(135deg, #5c6b45, #7c8a5e)",
            }}
          >
            {COUPLE.hashtag}
          </motion.p>

          <ArchFrame
            src={GALLERY[0]}
            alt=""
            className="mx-auto mt-8 h-64 w-64"
          />

          <p className="mt-6 font-serif text-lg italic" style={{ color: "#5c6b45" }}>
            We look forward to celebrating with you.
          </p>
        </section>

        <SectionDivider symbol="✦" />

        {/* GALLERY */}
        <section className="px-6">
          <h3 className="text-center text-[10px] uppercase" style={{ color: "#8d8463", letterSpacing: "0.35em" }}>
            Moments
          </h3>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {GALLERY.map((src, i) => (
              <ArchFrame key={i} src={src} alt={`Gallery ${i + 1}`} className="h-48 w-full" delay={i * 0.08} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.04, backgroundColor: "#5c6b45", color: "#fff" }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[10px] uppercase"
              style={{
                letterSpacing: "0.3em",
                border: "1px solid #5c6b45",
                color: "#5c6b45",
                background: "transparent",
              }}
            >
              <FaInstagram size={12} /> Our Story
            </motion.button>
          </div>
        </section>

        <SectionDivider />

        {/* RSVP */}
        <section ref={sectionRefs.rsvp}>
          <h3 className="text-center text-[10px] uppercase" style={{ color: "#8d8463", letterSpacing: "0.35em" }}>
            RSVP
          </h3>
          <p className="mt-2 text-center font-serif text-2xl italic" style={{ color: "#5c6b45" }}>
            Send Your Wishes
          </p>
          <div className="mt-6">
            <WishesForm />
          </div>
        </section>

        {/* FOOTER */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mt-10 py-12 text-center text-white"
          style={{
            background: "linear-gradient(180deg, #5c6b45 0%, #3f4632 100%)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaHeart className="mx-auto mb-4" size={22} />
          </motion.div>
          <p className="font-serif text-2xl italic">
            {COUPLE.groom.nickname} & {COUPLE.bride.nickname}
          </p>
          <p className="mt-2 text-[10px] uppercase opacity-80" style={{ letterSpacing: "0.35em" }}>
            {EVENT.date}
          </p>
        </motion.footer>
      </motion.div>

      {opened && <BottomNav active={activeNav} onNavigate={scrollTo} />}
    </div>
  );
}