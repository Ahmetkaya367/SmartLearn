import { Outlet } from "react-router";
import { Navbar } from "@/react-app/components/Navbar";
import { Footer } from "@/react-app/components/Footer";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
