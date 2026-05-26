import { Outlet } from "react-router-dom";
import { Footer } from "../components/layout/Footer";
import { Header } from "../components/layout/Header";

export function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
