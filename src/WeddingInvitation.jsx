import { useState, useEffect, useRef } from "react";
import { FaInstagram, FaMapMarkerAlt, FaVolumeUp, FaVolumeMute, FaHeart, FaHome, FaUserFriends, FaCalendarAlt, FaEnvelopeOpenText, FaLandmark } from "react-icons/fa";

import pamsPhoto from "./assets/pams.jpeg";
import bizzerPhoto from "./assets/Bizzer.jpeg";

/**
 * Wedding Invitation — "WedWebs" style template
 * Sage green / cream / gold aesthetic, vertical mobile-first scroll story.
 * Opens with a textured-envelope + wax-seal + 3D flap-open animation.
 *
 * Replace the placeholder content below (COUPLE, EVENT, GALLERY, WISHES, IMAGES)
 * with your own details and image imports.
 *
 * ⚠️ PHOTO URLS: use real, permanent links only. Never use a
 * "blob:..." URL copied from a browser tab (e.g. WhatsApp Web) —
 * those are temporary and only exist inside that one browser
 * session. They will be broken for every visitor, every time.
 * Use an image from your own /public folder, or upload to a host
 * like imgbb.com / Cloudinary and use the link it gives you.
 *
 * 👤 GUEST NAME: this page can be greeted to a specific guest two
 * ways — either pass a `guestName` prop directly, OR (this is the
 * one that matters once you're sharing per-guest QR codes) visit
 * the URL with `?guest=SomeName` on the end, e.g.:
 *
 *   https://yoursite.com/?guest=John
 *
 * The component reads that automatically below and shows
 * "Dear, John" without you wiring anything else up per guest.
 */

// ─────────────────────────────────────────────────────────
// 🔧 EDIT THIS DATA — your wedding details
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
    // 🔧 Replace this — see the warning at the top of this file about
    // why a "blob:" URL (e.g. from WhatsApp Web) will never work here.
    photo: pamsPhoto,
  },
};

const EVENT = {
  verse: "“So they are no longer two, but one flesh. Therefore what God has joined together, let no one separate.”",
  verseRef: "(Matthew 19:6)",
  day: "SATURDAY",
  date: "21 OCTOBER 2026",
  ceremonyTime: "18.00 WIB",
  afterPartyTime: "21.00 WIB",
  venueName: "Lausanne Ballroom Hotel Swissôtel PIK Jakarta",
  venueAddress: "Jl. Pantai Indah Kapuk, Kamal Muara, Penjaringan, Jakarta Utara",
  mapsUrl: "https://maps.google.com",
  // ISO datetime used for the live countdown
  weddingDateTimeISO: "2026-10-21T18:00:00+07:00",
};

const GALLERY = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=600&auto=format&fit=crop",
];

const HERO_VIDEO_POSTER =
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=1200&auto=format&fit=crop";

const BG_AMBIENT_MUSIC_URL = ""; // optional mp3 url

// ─────────────────────────────────────────────────────────
// 📬 RSVP delivery — see the note above WishesForm for why this
// exists and what your two real options are (email vs. a database).
// Sign up free at https://formspree.io, create a form there, and
// paste the endpoint it gives you below. Until you do, submissions
// only ever show up locally in the submitter's own browser.
// ─────────────────────────────────────────────────────────
const RSVP_EMAIL_ENDPOINT = "https://formspree.io/f/REPLACE_WITH_YOUR_FORM_ID";

// ─────────────────────────────────────────────────────────
// Global type + motion setup. Kept in one place (instead of
// scattered Tailwind arbitrary-value classes) so it survives
// regardless of how the host app's Tailwind build is configured.
// ─────────────────────────────────────────────────────────
function GlobalInviteStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Jost:wght@300;400;500;600&display=swap');

      .wi-root { font-family: 'Jost', sans-serif; }
      .wi-root .font-serif { font-family: 'Playfair Display', Georgia, serif !important; }

      @keyframes wi-tap-bob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(4px); }
      }
      @keyframes wi-tap-ripple {
        0% { transform: scale(0.55); opacity: 0.85; }
        100% { transform: scale(1.9); opacity: 0; }
      }
      .wi-tap-icon { animation: wi-tap-bob 1.6s ease-in-out infinite; }
      .wi-tap-ripple { animation: wi-tap-ripple 1.6s ease-out infinite; }

      @media (prefers-reduced-motion: reduce) {
        .wi-tap-icon, .wi-tap-ripple { animation: none; }
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────
// Decorative floral corner — pure SVG, no external assets.
// tone="gold" gives the lighter gold-on-cream look used on the
// envelope cover; tone="sage" (default) is used everywhere else.
// ─────────────────────────────────────────────────────────
function FloralCorner({ className = "", flip = false, tone = "sage" }) {
  const c =
    tone === "gold"
      ? { line: "#cdb583", petal: "#fbf6ea", petalStroke: "#e3d3ac", dot: "#c79a4e" }
      : { line: "#7c8a5e", petal: "#eef1e6", petalStroke: "#bcc7a3", dot: "#c9a14a" };
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none select-none ${className} ${flip ? "-scale-x-100" : ""}`}
      fill="none"
    >
      <g opacity="0.85">
        <path d="M20 180 Q40 120 90 100 Q140 80 160 30" stroke={c.line} strokeWidth="2" fill="none" />
        {[
          [40, 150], [55, 130], [70, 115], [90, 105], [110, 95], [130, 75], [145, 55],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx},${cy}) rotate(${i * 12})`}>
            <ellipse cx="0" cy="0" rx="9" ry="14" fill={c.petal} stroke={c.petalStroke} strokeWidth="0.5" />
            <ellipse cx="0" cy="0" rx="3" ry="4" fill={c.dot} opacity="0.55" />
          </g>
        ))}
        <circle cx="150" cy="35" r="5" fill={c.dot} opacity="0.7" />
      </g>
    </svg>
  );
}

function SectionDivider({ symbol = "&" }) {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <span className="h-px w-12" style={{ backgroundColor: "rgba(154,165,126,0.5)" }} />
      <span className="font-serif italic text-2xl" style={{ color: "#5c6b45" }}>{symbol}</span>
      <span className="h-px w-12" style={{ backgroundColor: "rgba(154,165,126,0.5)" }} />
    </div>
  );
}

// A tiny inline SVG used as a graceful fallback whenever a photo
// URL is broken (e.g. an expired "blob:" link) — so guests see a
// soft placeholder instead of a blank/broken image box.
const FALLBACK_PHOTO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
       <rect width="100%" height="100%" fill="#dde3cb"/>
       <text x="50%" y="50%" font-family="sans-serif" font-size="20" fill="#5c6b45" text-anchor="middle" dy=".3em">Photo</text>
     </svg>`
  );

function ArchFrame({ src, alt, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden shadow-xl ${className}`}
      style={{
        borderRadius: "999px 999px 12px 12px",
        border: "1px solid #d8cfb8",
      }}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(e) => {
          e.currentTarget.onerror = null; // avoid loop if the fallback itself ever fails
          e.currentTarget.src = FALLBACK_PHOTO;
        }}
      />
    </div>
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
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
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
  return (
    <div className="flex flex-col items-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-semibold shadow-sm sm:h-16 sm:w-16 sm:text-2xl"
        style={{ border: "1px solid #cabf9e", backgroundColor: "#fbf8f0", color: "#5c6b45" }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1.5 text-[10px] uppercase tracking-widest" style={{ color: "#7c8a5e" }}>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Bottom nav (matches the 4-icon dock in the reference video)
// ─────────────────────────────────────────────────────────
function BottomNav({ active, onNavigate }) {
  const items = [
    { id: "home", icon: FaHome, label: "Home" },
    { id: "couple", icon: FaUserFriends, label: "Couple" },
    { id: "event", icon: FaCalendarAlt, label: "Event" },
    { id: "rsvp", icon: FaEnvelopeOpenText, label: "RSVP" },
  ];
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center justify-between px-8 py-3 backdrop-blur"
      style={{ borderTop: "1px solid #e3dcc9", backgroundColor: "rgba(253,251,244,0.95)" }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center gap-1 text-[10px] transition"
            style={{ color: active === item.id ? "#5c6b45" : "#a9a08a" }}
          >
            <Icon size={16} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────
// RSVP form
//
// This intentionally has no public "wall" of past messages —
// every submission is sent privately via RSVP_EMAIL_ENDPOINT
// (a free Formspree form — see the constant near the top of this
// file) so every RSVP lands straight in your inbox. Nothing is
// displayed back on the page, and nothing is stored in a shared
// database, so guests never see each other's responses.
// ─────────────────────────────────────────────────────────
function WishesForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [attending, setAttending] = useState("yes");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    if (RSVP_EMAIL_ENDPOINT.includes("REPLACE_WITH_YOUR_FORM_ID")) {
      console.warn(
        "RSVP_EMAIL_ENDPOINT is still a placeholder — this RSVP was not sent anywhere. Set up a free form at https://formspree.io and paste the endpoint in."
      );
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
      if (res.ok) {
        setStatus("sent");
        setName("");
        setMessage("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="px-6 pb-10">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl p-5"
        style={{ border: "1px solid #dcd4ba", backgroundColor: "#fbf8f0" }}
      >
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest" style={{ color: "#7c8a5e" }}>Your Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent pb-2 text-sm outline-none"
            style={{ borderBottom: "1px solid #bcb497", color: "#3f4632" }}
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest" style={{ color: "#7c8a5e" }}>Will you attend?</label>
          <div className="flex gap-3">
            {["yes", "maybe", "no"].map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setAttending(opt)}
                className="flex-1 rounded-full px-3 py-1.5 text-xs capitalize transition"
                style={
                  attending === opt
                    ? { border: "1px solid #5c6b45", backgroundColor: "#5c6b45", color: "#fff" }
                    : { border: "1px solid #cabf9e", color: "#7c8a5e" }
                }
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest" style={{ color: "#7c8a5e" }}>
            Say something for our wedding <span style={{ color: "#fb7185" }}>*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full resize-none bg-transparent pb-2 text-sm outline-none"
            style={{ borderBottom: "1px solid #bcb497", color: "#3f4632" }}
            placeholder="Write your wishes..."
          />
        </div>

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full py-3 text-sm font-medium uppercase tracking-widest text-white shadow-md transition"
          style={{ backgroundColor: "#5c6b45", opacity: status === "sending" ? 0.7 : 1 }}
        >
          {status === "sending" ? "Sending…" : "Submit"}
        </button>

        {status === "sent" && (
          <p className="text-center text-xs" style={{ color: "#5c6b45" }}>Thank you — your RSVP has been sent! 💌</p>
        )}
        {status === "error" && (
          <p className="text-center text-xs" style={{ color: "#b3543f" }}>
            Couldn't send just now — please try again, or reach out to us directly.
          </p>
        )}
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Tap-to-open hint — small animated hand + ripple, used in place
// of a literal button so the envelope itself feels tappable.
// ─────────────────────────────────────────────────────────
function TapHint({ label = "Tap to Open" }) {
  return (
    <div className="flex flex-col items-center" style={{ marginTop: 16 }}>
      <span style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9a8c63" }}>
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
// Envelope cover / opening screen
//
// closed -> breaking (seal cracks) -> flapOpen (flap folds back)
// -> cardOut (letter rises out of the envelope and stays there).
//
// onOpen() is now only ever called from the "View Full Invitation"
// button inside the letter — there's no timer that auto-advances
// past it, so the reader can actually read the letter at their own
// pace instead of it flashing by and jumping into the full site.
//
// The mechanical envelope animation itself (breaking -> flapOpen
// -> cardOut) is still driven by chained setTimeouts rather than
// CSS `transitionend` events — that was the original stuck-button
// bug. If a transition's classes ever fail to apply, transitionend
// never fires; timers always complete regardless.
// ─────────────────────────────────────────────────────────
function CoverScreen({ onOpen, guestName }) {
  const [phase, setPhase] = useState("closed");
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleOpenClick = () => {
    if (phase !== "closed") return;
    setPhase("breaking");
    timers.current.push(
      setTimeout(() => {
        setPhase("flapOpen");
        timers.current.push(
          setTimeout(() => {
            setPhase("cardOut");
            // No auto-advance from here — the reader decides when
            // they're done reading the letter and taps through.
          }, 900)
        );
      }, 420)
    );
  };

  const sealBroken = phase !== "closed";
  const flapOpen = phase === "flapOpen" || phase === "cardOut";
  const cardVisible = phase === "cardOut";
  const monogram = `${COUPLE.groom.nickname[0]}${COUPLE.bride.nickname[0]}`;

  const paperTexture = {
    backgroundImage:
      "radial-gradient(circle at 18% 22%, rgba(255,255,255,0.7), transparent 55%), " +
      "repeating-linear-gradient(135deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 3px), " +
      "linear-gradient(160deg, #fdfaf3 0%, #f3ecdb 100%)",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{ background: "radial-gradient(circle at 50% 16%, #f3f0e2 0%, #e7e3cf 55%, #dad6c0 100%)" }}
    >
      <FloralCorner className="absolute left-0 top-0 h-32 w-32 opacity-80" tone="gold" />
      <FloralCorner className="absolute right-0 top-0 h-32 w-32 opacity-80" tone="gold" flip />
      <FloralCorner className="absolute bottom-0 left-0 h-32 w-32 -scale-y-100 opacity-80" tone="gold" flip />
      <FloralCorner className="absolute bottom-0 right-0 h-32 w-32 -scale-y-100 opacity-80" tone="gold" />

      {/* Envelope */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpenClick}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpenClick()}
        className="relative"
        style={{
          height: 540,
          width: 320,
          perspective: "1800px",
          cursor: phase === "closed" ? "pointer" : "default",
        }}
      >
        {/* Envelope body (pocket) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: 14, border: "1px solid #d9cfac", boxShadow: "0 25px 55px rgba(40,32,12,0.22)", ...paperTexture }}
        >
          {/* Letter — rises up out of the pocket once the flap is open.
              No timer moves past this; the reader taps through when ready. */}
          <div
            className="absolute inset-x-5 flex flex-col items-center px-6 text-center"
            style={{
              top: "15%",
              bottom: "5%",
              borderRadius: 10,
              border: "1px solid #cdbf99",
              background: "linear-gradient(160deg, #fffdf7 0%, #f6efdd 100%)",
              boxShadow: "0 12px 30px rgba(60,50,20,0.18)",
              opacity: cardVisible ? 1 : 0,
              transform: cardVisible ? "translateY(0)" : "translateY(36px)",
              transition: "opacity 600ms ease, transform 650ms cubic-bezier(0.22,1,0.36,1)",
              paddingTop: 28,
              paddingBottom: 22,
              justifyContent: "flex-start",
            }}
          >
            <p style={{ fontSize: 9.5, letterSpacing: "0.32em", textTransform: "uppercase", color: "#9a8c63" }}>
              Together With Their Families
            </p>

            <p className="font-serif italic" style={{ fontSize: 26, marginTop: 14, color: "#a9763c" }}>&amp;</p>

            <h1 className="font-serif italic" style={{ fontSize: 25, marginTop: 8, color: "#3c4630", lineHeight: 1.25 }}>
              {COUPLE.groom.nickname} &amp; {COUPLE.bride.nickname}
            </h1>

            <div style={{ width: 32, height: 1, backgroundColor: "#cdb583", margin: "16px auto" }} />

            <p style={{ fontSize: 12, color: "#5c5848", lineHeight: 1.6, maxWidth: 220 }}>
              request the honour of your presence as we begin our forever
            </p>

            {guestName && (
              <p style={{ marginTop: 14, fontSize: 12, color: "#7a6c4c" }}>
                Dear, <span style={{ fontWeight: 500 }}>{guestName}</span>
              </p>
            )}

            <p style={{ marginTop: 16, fontSize: 11, letterSpacing: "0.18em", color: "#8a7b53" }}>
              {EVENT.date.toUpperCase()}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              style={{
                marginTop: 24,
                borderRadius: 999,
                padding: "11px 28px",
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 500,
                color: "#fff",
                background: "#5c6b45",
                border: "none",
                boxShadow: "0 10px 22px rgba(60,50,20,0.25)",
                cursor: "pointer",
                opacity: cardVisible ? 1 : 0,
                transform: cardVisible ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 500ms ease 450ms, transform 500ms ease 450ms",
              }}
            >
              View Full Invitation
            </button>
          </div>
        </div>

        {/* Flap — hinged at the top edge, folds backward open */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "62%",
            transformOrigin: "top center",
            transformStyle: "preserve-3d",
            transform: flapOpen ? "rotateX(-168deg)" : "rotateX(0deg)",
            transition: "transform 900ms cubic-bezier(0.6,0,0.35,1)",
            zIndex: 2,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              backfaceVisibility: "hidden",
              border: "1px solid #d9cfac",
              borderTop: "none",
              boxShadow: "inset 0 -10px 18px -12px rgba(60,48,20,0.25)",
              ...paperTexture,
            }}
          />
        </div>

        {/* Wax seal — sits on the seam, cracks open on tap */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "62%",
            transform: `translate(-50%, -50%) ${sealBroken ? "scale(1.55) rotate(22deg)" : "scale(1) rotate(0deg)"}`,
            opacity: sealBroken ? 0 : 1,
            pointerEvents: sealBroken ? "none" : "auto",
            transition: "opacity 380ms ease, transform 380ms ease",
            zIndex: 3,
            width: 62,
            height: 62,
            borderRadius: "50%",
            background: "radial-gradient(circle at 35% 30%, #ecd9a8, #b9874a 75%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 5px 12px rgba(0,0,0,0.3), inset 0 2px 3px rgba(255,255,255,0.3)",
          }}
        >
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: 20, color: "#fffdf6" }}>
            {monogram}
          </span>
        </div>

        {/* Guest line + tap hint, fades out once tapped */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "70%",
            textAlign: "center",
            opacity: phase === "closed" ? 1 : 0,
            pointerEvents: phase === "closed" ? "auto" : "none",
            transition: "opacity 300ms ease",
          }}
        >
          {guestName && (
            <p style={{ fontSize: 12, color: "#7a6c4c" }}>
              Dear, <span style={{ fontWeight: 500 }}>{guestName}</span>
            </p>
          )}
          <TapHint />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
//
// `guestName` can arrive two ways:
//   1. A `guestName` prop passed in directly (e.g. if some parent
//      route/component already knows who's visiting).
//   2. A `?guest=Name` query parameter on the URL — this is what
//      makes per-guest QR codes work: each guest's code just points
//      at `yoursite.com/?guest=TheirName`, and the line below reads
//      it automatically once the page loads.
//
// If both are present, the URL takes priority, since that's the
// one that actually changes per visit/per QR code.
// ─────────────────────────────────────────────────────────
export default function WeddingInvitation({ guestName: guestNameProp = "" }) {
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const [guestName, setGuestName] = useState(guestNameProp);
  const audioRef = useRef(null);
  const countdown = useCountdown(EVENT.weddingDateTimeISO);

  const sectionRefs = {
    home: useRef(null),
    couple: useRef(null),
    event: useRef(null),
    rsvp: useRef(null),
  };

  // Reads ?guest=Name from the current URL once on mount. This is
  // what lets a guest's own QR code open the same deployed site but
  // greet them by name — no per-guest build or prop wiring needed.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const guestFromUrl = params.get("guest");
    if (guestFromUrl) {
      setGuestName(decodeURIComponent(guestFromUrl));
    }
  }, []);

  const scrollTo = (id) => {
    setActiveNav(id);
    sectionRefs[id]?.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (opened && audioRef.current && !muted) {
      audioRef.current.play().catch(() => {});
    }
  }, [opened, muted]);

  return (
    <div className="wi-root relative min-h-screen w-full" style={{ backgroundColor: "#f6f3e8", color: "#3f4632" }}>
      <GlobalInviteStyles />

      {/* Optional background music */}
      {BG_AMBIENT_MUSIC_URL && <audio ref={audioRef} src={BG_AMBIENT_MUSIC_URL} loop />}

      {!opened && <CoverScreen onOpen={() => setOpened(true)} guestName={guestName} />}

      <div
        className="mx-auto max-w-md pb-24 transition-opacity duration-700"
        style={{ opacity: opened ? 1 : 0 }}
      >
        {/* Mute toggle */}
        {opened && BG_AMBIENT_MUSIC_URL && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="fixed right-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full shadow"
            style={{ backgroundColor: "rgba(255,255,255,0.8)", color: "#5c6b45" }}
          >
            {muted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
          </button>
        )}

        {/* ───────── HERO / HOME — now shows both names ───────── */}
        <section ref={sectionRefs.home} className="relative px-6 pt-10 text-center">
          <p className="font-serif text-2xl italic" style={{ color: "#5c6b45" }}>&amp;</p>

          <ArchFrame
            src={HERO_VIDEO_POSTER}
            alt="Cover"
            className="mx-auto mt-6 h-[420px] w-[280px]"
          />

          <h2 className="mt-6 font-serif text-3xl italic" style={{ color: "#3f4632" }}>
            {COUPLE.groom.nickname} &amp; {COUPLE.bride.nickname}
          </h2>
          <p className="mt-1 text-sm tracking-wide" style={{ color: "#5c5848" }}>
            {COUPLE.groom.fullName} &amp; {COUPLE.bride.fullName}
          </p>
        </section>

        <SectionDivider />

        {/* ───────── VERSE ───────── */}
        <section className="relative mx-6 overflow-hidden rounded-2xl px-6 py-10 text-center" style={{ backgroundColor: "#dde3cb" }}>
          <FloralCorner className="absolute -right-6 -top-6 h-24 w-24 opacity-60" />
          <p className="font-serif text-base italic leading-relaxed" style={{ color: "#3f4632" }}>{EVENT.verse}</p>
          <p className="mt-3 text-sm" style={{ color: "#5c6b45" }}>{EVENT.verseRef}</p>
        </section>

        <SectionDivider symbol="✦" />

        {/* ───────── COUPLE ───────── */}
        <section ref={sectionRefs.couple} className="px-6">
          <h3 className="text-center text-xs uppercase tracking-[0.3em]" style={{ color: "#8d8463" }}>The Couple</h3>

          {[COUPLE.groom, COUPLE.bride].map((p, idx) => (
            <div key={idx} className="mt-8 text-center">
              <ArchFrame src={p.photo} alt={p.nickname} className="mx-auto h-72 w-56" />
              <p className="mt-5 font-serif text-2xl italic" style={{ color: "#5c6b45" }}>{p.nickname}</p>
              <p className="mt-1 text-base font-medium">{p.fullName}</p>
              <p className="mt-2 text-xs" style={{ color: "#7c8a5e" }}>
                {idx === 0 ? "Son of" : "Daughter of"}
              </p>
              <p className="text-sm" style={{ color: "#5c5848" }}>{p.parents[0]}</p>
              <p className="text-sm" style={{ color: "#5c5848" }}>&amp; {p.parents[1]}</p>
              <a
                href={p.instagram}
                target="_blank"
                rel="noreferrer"
                className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: "#3f4632" }}
              >
                <FaInstagram size={16} />
              </a>
            </div>
          ))}

          <div className="mt-10 text-center font-serif text-3xl italic" style={{ color: "#5c6b45" }}>&amp;</div>
        </section>

        <SectionDivider />

        {/* ───────── WITH LOVE / INVITATION TEXT ───────── */}
        <section className="relative px-10 text-center">
          <FloralCorner className="absolute -left-2 top-0 h-20 w-20 opacity-60" />
          <FloralCorner className="absolute -right-2 top-0 h-20 w-20 opacity-60" flip />
          <h3 className="mt-6 font-serif text-2xl">With Love.</h3>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "#5c5848" }}>
            We request the honor of your presence on our special day that will be held on:
          </p>
        </section>

        {/* ───────── EVENT DETAILS ───────── */}
        <section
          ref={sectionRefs.event}
          className="relative mx-6 mt-8 overflow-hidden rounded-[40px] px-6 pb-10 pt-8 text-center"
          style={{ background: "linear-gradient(180deg, #f3d9cf 0%, #fbf3ee 100%)" }}
        >
          <p className="text-sm uppercase tracking-[0.2em]" style={{ color: "#8a5c4f" }}>{EVENT.day}</p>
          <p className="mt-2 font-serif text-xl">{EVENT.date}</p>
          <p className="mt-1 text-sm" style={{ color: "#8a5c4f" }}>{EVENT.ceremonyTime}</p>

          <div className="my-5 h-px w-2/3 mx-auto" style={{ backgroundColor: "#d8b9a3" }} />

          <p className="text-sm uppercase tracking-[0.2em]" style={{ color: "#8a5c4f" }}>After Party</p>
          <p className="mt-1 text-sm" style={{ color: "#8a5c4f" }}>{EVENT.afterPartyTime}</p>

          <div className="mt-6 flex justify-center" style={{ color: "#8a5c4f" }}>
            <FaLandmark size={26} />
          </div>
          <p className="mt-3 font-medium leading-snug">{EVENT.venueName}</p>
          <p className="mt-2 text-xs italic" style={{ color: "#8a5c4f" }}>{EVENT.venueAddress}</p>

          <a
            href={EVENT.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-white shadow-md transition"
            style={{ backgroundColor: "#5c6b45" }}
          >
            <FaMapMarkerAlt size={14} /> View Location
          </a>
        </section>

        {/* ───────── COUNTDOWN ───────── */}
        <section className="relative mt-12 px-6 text-center">
          <div className="flex justify-center gap-3">
            <CountdownBlock value={countdown.days} label="Days" />
            <CountdownBlock value={countdown.hours} label="Hours" />
            <CountdownBlock value={countdown.minutes} label="Minutes" />
            <CountdownBlock value={countdown.seconds} label="Seconds" />
          </div>

          <p className="mt-5 inline-block rounded-full px-4 py-1.5 text-xs font-medium text-white" style={{ backgroundColor: "#5c6b45" }}>
            {COUPLE.hashtag}
          </p>

          <div className="relative mx-auto mt-8 h-64 w-64 overflow-hidden rounded-t-full" style={{ border: "4px solid #dde3cb" }}>
            <img
              src={GALLERY[0]}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = FALLBACK_PHOTO;
              }}
            />
          </div>

          <p className="mt-6 font-serif italic" style={{ color: "#5c6b45" }}>
            We look forward to seeing you on our special day
          </p>
        </section>

        <SectionDivider symbol="✦" />

        {/* ───────── GALLERY / OUR STORY ───────── */}
        <section className="px-6">
          <h3 className="text-center text-xs uppercase tracking-[0.3em]" style={{ color: "#8d8463" }}>Moments</h3>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {GALLERY.map((src, i) => (
              <ArchFrame key={i} src={src} alt={`Gallery ${i + 1}`} className="h-44 w-full" />
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-widest transition"
              style={{ border: "1px solid #5c6b45", color: "#5c6b45" }}
            >
              <FaInstagram size={14} /> Our Story
            </button>
          </div>
        </section>

        <SectionDivider />

        {/* ───────── RSVP ───────── */}
        <section ref={sectionRefs.rsvp}>
          <h3 className="text-center text-xs uppercase tracking-[0.3em]" style={{ color: "#8d8463" }}>
            RSVP
          </h3>
          <div className="mt-6">
            <WishesForm />
          </div>
        </section>

        {/* ───────── FOOTER ───────── */}
        <footer className="mt-4 py-10 text-center text-white" style={{ backgroundColor: "#5c6b45" }}>
          <FaHeart className="mx-auto mb-3" size={20} />
          <p className="font-serif text-lg italic">
            {COUPLE.groom.nickname} &amp; {COUPLE.bride.nickname}
          </p>
          <p className="mt-1 text-xs uppercase tracking-widest opacity-80">{EVENT.date}</p>
        </footer>
      </div>

      {opened && <BottomNav active={activeNav} onNavigate={scrollTo} />}
    </div>
  );
}