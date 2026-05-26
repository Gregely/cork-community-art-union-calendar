import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/events", label: "Events" },
  { to: "/submit", label: "Submit" },
  { to: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 py-4 min-[360px]:px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <NavLink to="/" className="font-display text-xl font-black leading-none text-ink min-[360px]:text-2xl">
          Cork Community
          <span className="block text-corkRed">Art Union Calendar</span>
        </NavLink>
        <nav className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center justify-center rounded-full border-2 border-ink px-3 py-2 text-center text-sm font-black focus:outline-none focus:ring-4 focus:ring-posterYellow sm:px-4 ${
                  isActive ? "bg-ink text-paper" : "bg-white text-ink hover:bg-posterYellow"
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
