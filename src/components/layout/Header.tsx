import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/events", label: "Listings" },
  { to: "/submit", label: "Submit" },
  { to: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-cream">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <NavLink
          to="/"
          className="flex flex-col leading-none"
          aria-label="Cork Culture Board home"
        >
          <span className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-ink sm:text-3xl">CCAU</span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-cacao sm:text-[11px]">
              /kə-ˈkau/
            </span>
          </span>
          <span className="mt-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-cacao sm:text-[11px]">
            Cork Culture Board
          </span>
        </NavLink>
        <nav className="flex flex-wrap gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex min-h-10 items-center rounded-full border-2 border-ink px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.1em] transition-[background-color,transform] hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-posterYellow sm:px-4 ${
                  isActive
                    ? "bg-ink text-creamLight"
                    : "bg-creamLight text-ink hover:bg-posterYellow"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
