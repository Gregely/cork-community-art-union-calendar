import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-16 border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="font-bold">Cork Culture Board is a Cork Community Arts Union project.</p>
        <div className="flex flex-col gap-2 font-black min-[360px]:flex-row min-[360px]:gap-4">
          <Link to="/submit" className="inline-flex min-h-11 items-center hover:text-posterYellow focus:outline-none focus:ring-4 focus:ring-posterYellow">
            Submit event
          </Link>
          <Link to="/admin/login" className="inline-flex min-h-11 items-center hover:text-posterYellow focus:outline-none focus:ring-4 focus:ring-posterYellow">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
