import WeddingInvitation from "./WeddingInvitation";
import GuestQrCodes from "./GuestQrCodes";
import CheckInScanner from "./CheckInScanner";
import GuestQrPage from "./GuestQrPage";

export default function App() {
  const path = window.location.pathname;
  const hash = window.location.hash;

  if (path === "/admin-qr") return <GuestQrCodes />;
  if (path === "/checkin") return <CheckInScanner />;

  // Public page the guest opens from the email link, e.g. /#qr/<token>
  if (hash.startsWith("#qr/")) {
    return <GuestQrPage token={decodeURIComponent(hash.slice(4))} />;
  }

  return <WeddingInvitation />;
}