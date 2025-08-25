"use client";

import { usePathname } from "next/navigation";
import Header from "../components/header";
import Footer from "../components/footer";

import RealTimeVehicleNotifier from "./RealTimeVehicleNotifier";
import LiveChat from "./LiveChat";
import { useAuth } from "../context/auth-context";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const hideLayoutRoutes = ["/verify-email", "/verify-email/notice"];
  const shouldHide = hideLayoutRoutes.includes(pathname);

  return (
    <>
      {!shouldHide && <Header />}
      <main className="flex-1">{children}</main>
      {!shouldHide && <Footer />}
      <RealTimeVehicleNotifier />
      {!shouldHide && !isAdmin && <LiveChat />}
    </>
  );
}
