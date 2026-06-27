import WeddingInvitation from "./WeddingInvitation";
import GuestQrCodes from "./GuestQrCodes";

export default function App() {
  const isAdminPage = window.location.pathname === "/admin-qr";
  return isAdminPage ? <GuestQrCodes /> : <WeddingInvitation />;
}