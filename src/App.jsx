import WeddingInvitation from "./WeddingInvitation";
import GuestQrCodes from "./GuestQrCodes";
import CheckInScanner from "./CheckInScanner";

export default function App() {
  const path = window.location.pathname;

  if (path === "/admin-qr") return <GuestQrCodes />;
  if (path === "/checkin") return <CheckInScanner />;

  return <WeddingInvitation />;
}