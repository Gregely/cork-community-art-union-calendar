import { Link } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";

export function NotFoundPage() {
  return (
    <PageShell title="Page not found" intro="This page has not made it onto the noticeboard.">
      <Link to="/" className="button-primary bg-ink text-paper">
        Back home
      </Link>
    </PageShell>
  );
}
