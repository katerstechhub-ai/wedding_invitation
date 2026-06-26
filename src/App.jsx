import WeddingInvitation from "./WeddingInvitation";

export default function App() {
  // Optional: pull guest name from URL query e.g. ?to=Rio
  const params = new URLSearchParams(window.location.search);
  const guestName = params.get("to") || "";

  return <WeddingInvitation guestName={guestName} />;
}