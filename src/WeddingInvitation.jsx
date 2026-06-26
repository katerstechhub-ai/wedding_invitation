import { useState, useEffect, useRef } from "react";
import { FaInstagram, FaMapMarkerAlt, FaVolumeUp, FaVolumeMute, FaHeart } from "react-icons/fa";

/**
 * Wedding Invitation — "WedWebs" style template
 * Sage green / cream / floral aesthetic, vertical mobile-first scroll story.
 * Opens with a 3D card-flip animation (perspective + rotateY).
 *
 * Replace the placeholder content below (COUPLE, EVENT, GALLERY, WISHES, IMAGES)
 * with your own details and image imports.
 */

// ─────────────────────────────────────────────────────────
// 🔧 EDIT THIS DATA — your wedding details
// ─────────────────────────────────────────────────────────
const COUPLE = {
  hashtag: "#EGIIRENEWEDDING",
  groom: {
    nickname: "Egi",
    fullName: "Egi Surya Abraham",
    parents: ["Mr. Andi Ho Fiauw Phin", "Mrs. Kartini Alamsjah"],
    instagram: "https://instagram.com/",
    photo: "https://images.unsplash.com/photo-1542156822-6924d1a71ace?q=80&w=800&auto=format&fit=crop",
  },
  bride: {
    nickname: "Irene",
    fullName: "Irene Dharma",
    parents: ["Mr. Budi Dharma", "Mrs. Susan Dharma"],
    instagram: "https://instagram.com/",
    photo: "https://images.unsplash.com/photo-1525258946800-98cfd641b8a6?q=80&w=800&auto=format&fit=crop",
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
// Decorative floral corner — pure SVG, no external assets
// ─────────────────────────────────────────────────────────
function FloralCorner({ className = "", flip = false }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`pointer-events-none select-none ${className} ${flip ? "-scale-x-100" : ""}`}
      fill="none"
    >
      <g opacity="0.85">
        <path d="M20 180 Q40 120 90 100 Q140 80 160 30" stroke="#7c8a5e" strokeWidth="2" fill="none" />
        {[
          [40, 150], [55, 130], [70, 115], [90, 105], [110, 95], [130, 75], [145, 55],
        ].map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx},${cy}) rotate(${i * 12})`}>
            <ellipse cx="0" cy="0" rx="9" ry="14" fill="#eef1e6" stroke="#bcc7a3" strokeWidth="0.5" />
            <ellipse cx="0" cy="0" rx="3" ry="4" fill="#d8b9a3" opacity="0.6" />
          </g>
        ))}
        <circle cx="150" cy="35" r="5" fill="#c9a14a" opacity="0.7" />
      </g>
    </svg>
  );
}

function SectionDivider({ symbol = "&" }) {
  return (
    <div className="flex items-center justify-center gap-4 py-8">
      <span className="h-px w-12 bg-[#9aa57e]/50" />
      <span className="font-serif italic text-2xl text-[#5c6b45]">{symbol}</span>
      <span className="h-px w-12 bg-[#9aa57e]/50" />
    </div>
  );
}

function ArchFrame({ src, alt, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden border border-[#d8cfb8] shadow-[0_8px_30px_rgba(0,0,0,0.12)] ${className}`}
      style={{ borderRadius: "999px 999px 12px 12px" }}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
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
      <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-[#cabf9e] bg-[#fbf8f0] text-xl font-semibold text-[#5c6b45] shadow-sm sm:h-16 sm:w-16 sm:text-2xl">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1.5 text-[10px] uppercase tracking-widest text-[#7c8a5e]">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Bottom nav (matches the 4-icon dock in the reference video)
// ─────────────────────────────────────────────────────────
function BottomNav({ active, onNavigate }) {
  const items = [
    { id: "home", icon: "📱", label: "Home" },
    { id: "couple", icon: "💑", label: "Couple" },
    { id: "event", icon: "📅", label: "Event" },
    { id: "rsvp", icon: "💌", label: "RSVP" },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md items-center justify-between border-t border-[#e3dcc9] bg-[#fdfbf4]/95 px-8 py-3 backdrop-blur">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center gap-0.5 text-[10px] transition ${
            active === item.id ? "text-[#5c6b45]" : "text-[#a9a08a]"
          }`}
        >
          <span className="text-base leading-none">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────
// RSVP / Wishes form
// ─────────────────────────────────────────────────────────
function WishesForm() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [attending, setAttending] = useState("yes");
  const [wishes, setWishes] = useState([
    { name: "Rio", text: "Congrats for the wedding Pak Egiii", time: "October 21, 2026 · 5:44 pm" },
    { name: "Arindra", text: "Congratss lovebirds Egi and Irene! ❤️", time: "October 21, 2026 · 4:02 pm" },
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setWishes((prev) => [
      { name, text: message, time: "Just now" },
      ...prev,
    ]);
    setName("");
    setMessage("");
  };

  return (
    <div className="px-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[#dcd4ba] bg-[#fbf8f0] p-5">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-[#7c8a5e]">Your Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-b border-[#bcb497] bg-transparent pb-2 text-sm text-[#3f4632] outline-none focus:border-[#5c6b45]"
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-[#7c8a5e]">Will you attend?</label>
          <div className="flex gap-3">
            {["yes", "maybe", "no"].map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => setAttending(opt)}
                className={`flex-1 rounded-full border px-3 py-1.5 text-xs capitalize transition ${
                  attending === opt
                    ? "border-[#5c6b45] bg-[#5c6b45] text-white"
                    : "border-[#cabf9e] text-[#7c8a5e]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs uppercase tracking-widest text-[#7c8a5e]">
            Say something for our wedding <span className="text-rose-400">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full resize-none border-b border-[#bcb497] bg-transparent pb-2 text-sm text-[#3f4632] outline-none focus:border-[#5c6b45]"
            placeholder="Write your wishes..."
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-[#5c6b45] py-3 text-sm font-medium uppercase tracking-widest text-white shadow-md transition hover:bg-[#4b5938]"
        >
          Submit
        </button>
      </form>

      <div className="mt-6 space-y-3 pb-10">
        {wishes.map((w, i) => (
          <div key={i} className="rounded-xl border border-[#e3dcc9] bg-[#fdfbf4] p-4 shadow-sm">
            <p className="text-sm font-semibold text-[#3f4632]">{w.name}</p>
            <p className="mt-1 text-sm text-[#5c5848]">{w.text}</p>
            <p className="mt-2 text-[11px] text-[#a9a08a]">{w.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 3D Cover / opening screen — card flips open like a book
// ─────────────────────────────────────────────────────────
function CoverScreen({ onOpen, guestName }) {
  // phase: "idle" -> "flipping" -> calls onOpen() once animation finishes
  const [phase, setPhase] = useState("idle");
  const cardRef = useRef(null);

  const handleOpenClick = () => {
    if (phase !== "idle") return;
    setPhase("flipping");
  };

  const handleTransitionEnd = (e) => {
    // Only react to the transform transition on the card itself
    if (e.propertyName === "transform" && phase === "flipping") {
      onOpen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#eef0e2] to-[#f6f3e8] px-6">
      <FloralCorner className="absolute left-0 top-0 h-40 w-40 opacity-70" />
      <FloralCorner className="absolute bottom-0 right-0 h-40 w-40 opacity-70" flip />

      {/* 3D stage */}
      <div
        className="relative h-[520px] w-[320px]"
        style={{ perspective: "1800px" }}
      >
        {/* Back layer — what's revealed once the card opens (inside of the invitation) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[28px] border border-[#cabf9e] bg-[#fbf8f0] px-8 text-center shadow-xl">
          <p className="font-serif text-2xl italic text-[#5c6b45]">&amp;</p>
          <h1 className="mt-4 font-serif text-xl tracking-wide text-[#3f4632]">
            {COUPLE.groom.nickname} <span className="italic">&amp;</span> {COUPLE.bride.nickname}
          </h1>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#8d8463]">
            Welcome to our wedding
          </p>
        </div>

        {/* Front layer — the closed invitation card. Rotates open on the left hinge. */}
        <div
          ref={cardRef}
          onTransitionEnd={handleTransitionEnd}
          className="absolute inset-0 rounded-[28px] border border-[#cabf9e] bg-[#5c6b45] shadow-2xl transition-transform duration-[1400ms] ease-[cubic-bezier(.65,0,.35,1)]"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "left center",
            transform: phase === "flipping" ? "rotateY(-115deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-[28px] px-8 text-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="absolute inset-3 rounded-2xl border border-white/25" />
            <p className="font-serif text-3xl italic text-[#f3eee0]">&amp;</p>
            <h1 className="mt-6 font-serif text-2xl tracking-wide text-[#f3eee0]">
              {COUPLE.groom.nickname} <span className="italic">&amp;</span> {COUPLE.bride.nickname}
            </h1>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-[#dfe3cf]">The Wedding Of</p>

            <div className="mt-8 rounded-full border border-white/40 px-5 py-2 text-sm text-[#f3eee0]">
              {guestName ? (
                <>Dear, <span className="font-medium">{guestName}</span></>
              ) : (
                "You're Invited"
              )}
            </div>

            <button
              onClick={handleOpenClick}
              disabled={phase !== "idle"}
              className="mt-10 rounded-full bg-[#f3eee0] px-10 py-3 text-sm uppercase tracking-widest text-[#3f4632] shadow-lg transition hover:bg-white disabled:opacity-70"
            >
              {phase === "idle" ? "Open Invitation" : "Opening..."}
            </button>
          </div>

          {/* Inside-of-front-cover face — visible briefly mid-rotation */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-[28px] bg-[#3f4632] px-8 text-center"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="font-serif text-lg italic text-[#dfe3cf]">With love,</p>
            <p className="mt-2 font-serif text-2xl italic text-[#f3eee0]">
              {COUPLE.groom.nickname} &amp; {COUPLE.bride.nickname}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────
export default function WeddingInvitation({ guestName = "" }) {
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(true);
  const [activeNav, setActiveNav] = useState("home");
  const audioRef = useRef(null);
  const countdown = useCountdown(EVENT.weddingDateTimeISO);

  const sectionRefs = {
    home: useRef(null),
    couple: useRef(null),
    event: useRef(null),
    rsvp: useRef(null),
  };

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
    <div className="relative min-h-screen w-full bg-[#f6f3e8] font-sans text-[#3f4632]">
      {/* Optional background music */}
      {BG_AMBIENT_MUSIC_URL && <audio ref={audioRef} src={BG_AMBIENT_MUSIC_URL} loop />}

      {!opened && <CoverScreen onOpen={() => setOpened(true)} guestName={guestName} />}

      <div className={`mx-auto max-w-md pb-24 transition-opacity duration-700 ${opened ? "opacity-100" : "opacity-0"}`}>
        {/* Mute toggle */}
        {opened && BG_AMBIENT_MUSIC_URL && (
          <button
            onClick={() => setMuted((m) => !m)}
            className="fixed right-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#5c6b45] shadow"
          >
            {muted ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
          </button>
        )}

        {/* ───────── HERO / HOME ───────── */}
        <section ref={sectionRefs.home} className="relative px-6 pt-10 text-center">
          <p className="font-serif text-2xl italic text-[#5c6b45]">&amp;</p>

          <ArchFrame
            src={HERO_VIDEO_POSTER}
            alt="Cover"
            className="mx-auto mt-6 h-[420px] w-[280px]"
          />

          <h2 className="mt-6 font-serif text-3xl italic text-[#3f4632]">{COUPLE.bride.nickname}</h2>
          <p className="mt-1 text-sm tracking-wide text-[#5c5848]">{COUPLE.bride.fullName}</p>
        </section>

        <SectionDivider />

        {/* ───────── VERSE ───────── */}
        <section className="relative mx-6 overflow-hidden rounded-2xl bg-[#dde3cb] px-6 py-10 text-center">
          <FloralCorner className="absolute -right-6 -top-6 h-24 w-24 opacity-60" />
          <p className="font-serif text-base italic leading-relaxed text-[#3f4632]">{EVENT.verse}</p>
          <p className="mt-3 text-sm text-[#5c6b45]">{EVENT.verseRef}</p>
        </section>

        <SectionDivider symbol="✦" />

        {/* ───────── COUPLE ───────── */}
        <section ref={sectionRefs.couple} className="px-6">
          <h3 className="text-center text-xs uppercase tracking-[0.3em] text-[#8d8463]">The Couple</h3>

          {[COUPLE.groom, COUPLE.bride].map((p, idx) => (
            <div key={idx} className="mt-8 text-center">
              <ArchFrame src={p.photo} alt={p.nickname} className="mx-auto h-72 w-56" />
              <p className="mt-5 font-serif text-2xl italic text-[#5c6b45]">{p.nickname}</p>
              <p className="mt-1 text-base font-medium">{p.fullName}</p>
              <p className="mt-2 text-xs text-[#7c8a5e]">
                {idx === 0 ? "Son of" : "Daughter of"}
              </p>
              <p className="text-sm text-[#5c5848]">{p.parents[0]}</p>
              <p className="text-sm text-[#5c5848]">&amp; {p.parents[1]}</p>
              <a
                href={p.instagram}
                target="_blank"
                rel="noreferrer"
                className="mx-auto mt-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#3f4632] text-white"
              >
                <FaInstagram size={16} />
              </a>
            </div>
          ))}

          <div className="mt-10 text-center font-serif text-3xl italic text-[#5c6b45]">&amp;</div>
        </section>

        <SectionDivider />

        {/* ───────── WITH LOVE / INVITATION TEXT ───────── */}
        <section className="relative px-10 text-center">
          <FloralCorner className="absolute -left-2 top-0 h-20 w-20 opacity-60" />
          <FloralCorner className="absolute -right-2 top-0 h-20 w-20 opacity-60" flip />
          <h3 className="mt-6 font-serif text-2xl">With Love.</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#5c5848]">
            We request the honor of your presence on our special day that will be held on:
          </p>
        </section>

        {/* ───────── EVENT DETAILS ───────── */}
        <section ref={sectionRefs.event} className="relative mx-6 mt-8 overflow-hidden rounded-[40px] bg-gradient-to-b from-[#f3d9cf] to-[#fbf3ee] px-6 pb-10 pt-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-[#8a5c4f]">{EVENT.day}</p>
          <p className="mt-2 font-serif text-xl">{EVENT.date}</p>
          <p className="mt-1 text-sm text-[#8a5c4f]">{EVENT.ceremonyTime}</p>

          <div className="my-5 h-px w-2/3 mx-auto bg-[#d8b9a3]" />

          <p className="text-sm uppercase tracking-[0.2em] text-[#8a5c4f]">After Party</p>
          <p className="mt-1 text-sm text-[#8a5c4f]">{EVENT.afterPartyTime}</p>

          <div className="mt-6 flex justify-center">
            <span className="text-2xl">🏛️</span>
          </div>
          <p className="mt-3 font-medium leading-snug">{EVENT.venueName}</p>
          <p className="mt-2 text-xs italic text-[#8a5c4f]">{EVENT.venueAddress}</p>

          <a
            href={EVENT.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#5c6b45] px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-white shadow-md transition hover:bg-[#4b5938]"
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

          <p className="mt-5 inline-block rounded-full bg-[#5c6b45] px-4 py-1.5 text-xs font-medium text-white">
            {COUPLE.hashtag}
          </p>

          <div className="relative mx-auto mt-8 h-64 w-64 overflow-hidden rounded-t-full border-4 border-[#dde3cb]">
            <img src={GALLERY[0]} alt="" className="h-full w-full object-cover" />
          </div>

          <p className="mt-6 font-serif italic text-[#5c6b45]">
            We look forward to seeing you on our special day
          </p>
        </section>

        <SectionDivider symbol="✦" />

        {/* ───────── GALLERY / OUR STORY ───────── */}
        <section className="px-6">
          <h3 className="text-center text-xs uppercase tracking-[0.3em] text-[#8d8463]">Moments</h3>
          <div className="mt-6 grid grid-cols-2 gap-4">
            {GALLERY.map((src, i) => (
              <ArchFrame key={i} src={src} alt={`Gallery ${i + 1}`} className="h-44 w-full" />
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="inline-flex items-center gap-2 rounded-full border border-[#5c6b45] px-5 py-2.5 text-xs font-medium uppercase tracking-widest text-[#5c6b45] transition hover:bg-[#5c6b45] hover:text-white">
              <FaInstagram size={14} /> Our Story
            </button>
          </div>
        </section>

        <SectionDivider />

        {/* ───────── RSVP / WISHES ───────── */}
        <section ref={sectionRefs.rsvp}>
          <h3 className="text-center text-xs uppercase tracking-[0.3em] text-[#8d8463]">
            RSVP &amp; Wishes
          </h3>
          <div className="mt-6">
            <WishesForm />
          </div>
        </section>

        {/* ───────── FOOTER ───────── */}
        <footer className="mt-4 bg-[#5c6b45] py-10 text-center text-white">
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