import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DisciplineBadge } from "../components/events/DisciplineBadge";
import { ShareCardModal } from "../components/events/ShareCardModal";
import { DisciplineChipPicker } from "../components/forms/DisciplineChipPicker";
import { OrganiserAutocomplete } from "../components/forms/OrganiserAutocomplete";
import { VenueAutocomplete } from "../components/forms/VenueAutocomplete";
import { PageShell } from "../components/layout/PageShell";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import { LoadingState } from "../components/shared/LoadingState";
import {
  approveEvent,
  deleteEvent,
  getApprovedEventsForAdmin,
  getPendingEvents,
  getRejectedEvents,
  getUnpublishedEvents,
  rejectEvent,
  republishEvent,
  restoreEventToPending,
  unpublishEvent,
  updateEventForAdmin,
  updatePendingEvent,
} from "../lib/adminEventQueries";
import { type AdminStats, getAdminStats } from "../lib/adminStatsQueries";
import { getCurrentUser, isCurrentUserAdmin, signOut } from "../lib/auth";
import type { Event, EventUpdate } from "../types/event";
import { getEventDisciplines } from "../types/event";
import { formatDate, formatDateTime, formatTimeRange } from "../utils/date";

// ── Types ──────────────────────────────────────────────────────────────────

type AdminTab = "overview" | "pending" | "published" | "unpublished" | "rejected" | "stats";

type EditFormState = {
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_id: string | null;
  venue: string;
  organiser_id: string | null;
  organiser: string;
  disciplines: string[];
  manual_maps_url: string;
  description: string;
  entry_fee: string;
  link_or_ticket_info: string;
  image_url: string;
  submitter_name: string;
  submitter_email: string;
  admin_notes: string;
};

// ── Helpers ────────────────────────────────────────────────────────────────

function getTodayForInput() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toEditForm(event: Event): EditFormState {
  return {
    title: event.title,
    event_date: event.event_date,
    start_time: event.start_time,
    end_time: event.end_time ?? "",
    venue_id: event.venue_id,
    venue: event.venue,
    organiser_id: event.organiser_id,
    organiser: event.organiser,
    disciplines: getEventDisciplines(event),
    manual_maps_url: event.manual_maps_url ?? "",
    description: event.description ?? "",
    entry_fee: event.entry_fee ?? "",
    link_or_ticket_info: event.link_or_ticket_info,
    image_url: event.image_url ?? "",
    submitter_name: event.submitter_name ?? "",
    submitter_email: event.submitter_email ?? "",
    admin_notes: event.admin_notes ?? "",
  };
}

function buildUpdateInput(form: EditFormState): EventUpdate {
  return {
    title: form.title.trim(),
    event_date: form.event_date,
    start_time: form.start_time,
    end_time: form.end_time || null,
    venue_id: form.venue_id,
    venue: form.venue.trim(),
    organiser_id: form.organiser_id,
    organiser: form.organiser.trim(),
    discipline: form.disciplines[0] ?? "",
    disciplines: form.disciplines,
    manual_maps_url: form.venue_id ? null : (form.manual_maps_url.trim() || null),
    description: form.description.trim() || null,
    entry_fee: form.entry_fee.trim() || null,
    link_or_ticket_info: form.link_or_ticket_info.trim(),
    image_url: form.image_url.trim() || null,
    submitter_name: form.submitter_name.trim() || null,
    submitter_email: form.submitter_email.trim() || null,
    admin_notes: form.admin_notes.trim() || null,
  };
}

function validateEditForm(form: EditFormState): string {
  if (!form.title.trim()) return "Event title is required.";
  if (!form.event_date) return "Event date is required.";
  if (!form.start_time) return "Start time is required.";
  if (!form.venue.trim()) return "Venue is required.";
  if (!form.organiser.trim()) return "Organiser is required.";
  if (form.disciplines.length === 0) return "At least one discipline is required.";

  if (form.submitter_email.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(form.submitter_email.trim())) {
      return "Submitter email should look like name@example.com.";
    }
  }

  if (form.manual_maps_url.trim()) {
    try { new URL(form.manual_maps_url.trim()); } catch {
      return "Maps link must be a valid URL.";
    }
  }

  return "";
}

// ── Tab bar ────────────────────────────────────────────────────────────────

type TabDef = {
  id: AdminTab;
  label: string;
  count?: number;
  urgent?: boolean;
};

function TabBar({
  tabs,
  active,
  onSelect,
}: {
  tabs: TabDef[];
  active: AdminTab;
  onSelect: (t: AdminTab) => void;
}) {
  return (
    <div className="mb-8 flex flex-wrap gap-1.5 border-b-2 border-ink pb-4">
      {tabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelect(tab.id)}
            className={`inline-flex min-h-10 items-center gap-1.5 border-2 border-ink px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] transition-[background-color,transform] hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-posterYellow ${
              isActive
                ? "bg-ink text-creamLight"
                : "bg-creamLight text-ink hover:bg-posterYellow"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 ? (
              <span
                className={`inline-flex min-w-5 items-center justify-center px-1 py-0.5 text-[10px] font-black ${
                  tab.urgent
                    ? isActive ? "bg-corkRed text-creamLight" : "bg-corkRed text-creamLight"
                    : isActive ? "bg-creamLight/20 text-creamLight" : "bg-ink/10 text-ink"
                }`}
              >
                {tab.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

// ── Status pill ────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:     "bg-posterYellow text-ink border-posterYellow",
    approved:    "bg-[#4a6b28] text-creamLight border-[#4a6b28]",
    unpublished: "bg-[#243040] text-creamLight border-[#243040]",
    rejected:    "bg-corkRed text-creamLight border-corkRed",
  };
  return (
    <span className={`inline-flex items-center border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] ${map[status] ?? "bg-creamLight text-ink border-ink"}`}>
      {status}
    </span>
  );
}

// ── Feedback banners ───────────────────────────────────────────────────────

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="mb-6 border-2 border-[#4a6b28] bg-[#4a6b28] p-4 shadow-paste">
      <p className="font-mono text-sm font-bold text-creamLight">{message}</p>
    </div>
  );
}

// ── Event card (shared across tabs) ───────────────────────────────────────

type EventCardProps = {
  event: Event;
  actions: React.ReactNode;
  showSubmitter?: boolean;
  showAdminNotes?: boolean;
  editPanel?: React.ReactNode;
  confirmPanel?: React.ReactNode;
};

function AdminEventCard({ event, actions, showSubmitter, editPanel, confirmPanel }: EventCardProps) {
  const today = getTodayForInput();
  const isPast = event.event_date < today;
  const eventDisciplines = getEventDisciplines(event);

  return (
    <article className="border-2 border-ink bg-creamLight p-4 shadow-paste sm:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: event info */}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {eventDisciplines.map((d) => <DisciplineBadge key={d} discipline={d} />)}
            <StatusPill status={event.status} />
            {isPast ? (
              <span className="border-2 border-ink bg-ink/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
                Past
              </span>
            ) : null}
          </div>

          <div>
            <h2 className="font-display text-2xl font-black text-ink min-[360px]:text-3xl">{event.title}</h2>
            <p className="mt-1 font-mono text-xs font-bold tracking-[0.06em] text-corkRed">
              {formatDate(event.event_date)} · {formatTimeRange(event.start_time, event.end_time)}
            </p>
          </div>

          <div className="grid gap-1 font-mono text-xs text-cacaoMid">
            <p><span className="font-bold text-ink">Venue:</span> {event.venue}</p>
            <p><span className="font-bold text-ink">Organiser:</span> {event.organiser}</p>
            {event.entry_fee ? <p><span className="font-bold text-ink">Entry:</span> {event.entry_fee}</p> : null}
            {event.link_or_ticket_info ? <p className="break-all"><span className="font-bold text-ink">Links:</span> {event.link_or_ticket_info}</p> : null}
          </div>

          {event.description ? (
            <p className="max-w-2xl text-sm leading-relaxed text-cacaoMid">{event.description}</p>
          ) : null}

          {showSubmitter && (event.submitter_name || event.submitter_email) ? (
            <div className="border-l-2 border-ink/20 pl-3 font-mono text-xs text-cacaoMid">
              {event.submitter_name ? <p><span className="font-bold text-ink">From:</span> {event.submitter_name}</p> : null}
              {event.submitter_email ? <p className="break-all"><span className="font-bold text-ink">Email:</span> {event.submitter_email}</p> : null}
              <p><span className="font-bold text-ink">Submitted:</span> {formatDateTime(event.created_at)}</p>
            </div>
          ) : null}

          {event.admin_notes ? (
            <p className="border-l-2 border-posterYellow pl-3 font-mono text-xs text-cacaoMid">
              <span className="font-bold text-ink">Notes:</span> {event.admin_notes}
            </p>
          ) : null}

          {confirmPanel}
          {editPanel}
        </div>

        {/* Right: action buttons */}
        <div className="flex w-full flex-col gap-2 min-[360px]:flex-row lg:w-44 lg:flex-col">
          {actions}
        </div>
      </div>
    </article>
  );
}

// ── Admin button variants ──────────────────────────────────────────────────

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "danger" | "ghost" };

function AdminBtn({ variant = "default", className = "", children, ...props }: BtnProps) {
  const base = "min-h-10 w-full border-2 border-ink px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-posterYellow";
  const variants: Record<string, string> = {
    default:  "bg-creamLight text-ink hover:bg-posterYellow",
    primary:  "bg-[#4a6b28] text-creamLight border-[#4a6b28] hover:opacity-90",
    danger:   "border-corkRed bg-corkRed text-creamLight hover:opacity-90",
    ghost:    "bg-transparent text-ink hover:bg-posterYellow",
  };
  return (
    <button type="button" className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

// ── Overview tab ───────────────────────────────────────────────────────────

function OverviewTab({
  pending,
  published,
  unpublished,
  rejected,
  onGoTo,
}: {
  pending: Event[];
  published: Event[];
  unpublished: Event[];
  rejected: Event[];
  onGoTo: (tab: AdminTab) => void;
}) {
  const today = getTodayForInput();
  const upcoming = published.filter((e) => e.event_date >= today).length;
  const past = published.filter((e) => e.event_date < today).length;

  const statCards = [
    { label: "Pending review", value: pending.length, tab: "pending" as AdminTab, urgent: pending.length > 0, bg: "bg-posterYellow" },
    { label: "Live / published", value: published.length, tab: "published" as AdminTab, urgent: false, bg: "bg-creamLight" },
    { label: "Unpublished", value: unpublished.length, tab: "unpublished" as AdminTab, urgent: unpublished.length > 0, bg: "bg-creamLight" },
    { label: "Rejected", value: rejected.length, tab: "rejected" as AdminTab, urgent: false, bg: "bg-creamLight" },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => onGoTo(card.tab)}
            className={`group border-2 border-ink ${card.bg} p-5 text-left shadow-paste transition-transform hover:-translate-y-0.5 hover:shadow-poster focus:outline-none focus:ring-4 focus:ring-posterYellow`}
          >
            <p className={`font-display text-5xl font-black leading-none ${card.urgent && card.value > 0 ? "text-corkRed" : "text-ink"}`}>
              {card.value}
            </p>
            <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-cacaoMid">
              {card.label}
            </p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.06em] text-cacao opacity-0 transition-opacity group-hover:opacity-100">
              View →
            </p>
          </button>
        ))}
      </div>

      {/* Upcoming vs past */}
      <div className="border-2 border-ink bg-creamLight p-5 shadow-paste">
        <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-corkRed">Published breakdown</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="font-display text-3xl font-black text-ink">{upcoming}</p>
            <p className="mt-1 font-mono text-xs text-cacaoMid">Upcoming (today or later)</p>
          </div>
          <div>
            <p className="font-display text-3xl font-black text-ink">{past}</p>
            <p className="mt-1 font-mono text-xs text-cacaoMid">Past events</p>
          </div>
        </div>
      </div>

      {/* Needs attention */}
      {(pending.length > 0 || unpublished.length > 0) ? (
        <div className="border-2 border-corkRed bg-creamLight p-5 shadow-paste">
          <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-corkRed">Needs attention</p>
          <div className="space-y-2">
            {pending.length > 0 ? (
              <button
                type="button"
                onClick={() => onGoTo("pending")}
                className="flex w-full items-center justify-between border-2 border-ink bg-posterYellow px-4 py-3 text-left font-mono text-xs font-bold uppercase tracking-[0.08em] text-ink hover:shadow-paste focus:outline-none focus:ring-4 focus:ring-posterYellow"
              >
                <span>{pending.length} submission{pending.length !== 1 ? "s" : ""} waiting for review</span>
                <span>→</span>
              </button>
            ) : null}
            {unpublished.length > 0 ? (
              <button
                type="button"
                onClick={() => onGoTo("unpublished")}
                className="flex w-full items-center justify-between border-2 border-ink bg-creamLight px-4 py-3 text-left font-mono text-xs font-bold uppercase tracking-[0.08em] text-ink hover:bg-posterYellow focus:outline-none focus:ring-4 focus:ring-posterYellow"
              >
                <span>{unpublished.length} unpublished event{unpublished.length !== 1 ? "s" : ""} — re-publish or delete</span>
                <span>→</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-cacao/40 p-5">
          <p className="font-mono text-xs text-cacao">Nothing needs attention right now.</p>
        </div>
      )}

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Link to="/admin/data" className="button-primary bg-creamLight text-ink">
          Manage venues &amp; organisers →
        </Link>
        <Link to="/events" target="_blank" rel="noopener noreferrer" className="button-primary bg-creamLight text-ink">
          View public listings →
        </Link>
      </div>
    </div>
  );
}

// ── Stats tab ──────────────────────────────────────────────────────────────

function StatsTab({ stats, isLoading, error }: { stats: AdminStats | null; isLoading: boolean; error: string }) {
  if (isLoading) return <LoadingState message="Crunching the numbers..." />;
  if (error) return <ErrorState message={error} />;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Top-line numbers */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total events (all time)", value: stats.totalEvents },
          { label: "Upcoming (live)", value: stats.upcomingApproved },
          { label: "Past (live)", value: stats.pastApproved },
        ].map((s) => (
          <div key={s.label} className="border-2 border-ink bg-creamLight p-5 shadow-paste">
            <p className="font-display text-5xl font-black text-ink">{s.value}</p>
            <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-cacaoMid">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Discipline breakdown */}
      {stats.byDiscipline.length > 0 ? (
        <div className="border-2 border-ink bg-creamLight p-5 shadow-paste">
          <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-corkRed">By discipline (published events)</p>
          <div className="space-y-2">
            {stats.byDiscipline.map(({ discipline, count }) => (
              <div key={discipline} className="flex items-center gap-3">
                <DisciplineBadge discipline={discipline} />
                <div className="flex flex-1 items-center gap-3">
                  <div
                    className="h-2 bg-ink/20"
                    style={{ width: `${Math.max(4, (count / (stats.byDiscipline[0]?.count ?? 1)) * 100)}%` }}
                  />
                  <span className="font-mono text-xs font-bold text-ink">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Top venues */}
      {stats.byVenue.length > 0 ? (
        <div className="border-2 border-ink bg-creamLight p-5 shadow-paste">
          <p className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-corkRed">Top venues (published events)</p>
          <div className="space-y-2">
            {stats.byVenue.map(({ venue, count }) => (
              <div key={venue} className="flex items-center justify-between gap-4 border-b border-ink/10 py-1.5">
                <p className="font-mono text-xs text-ink">{venue}</p>
                <p className="font-mono text-xs font-bold text-cacaoMid">{count}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export function AdminDashboardPage() {
  const navigate = useNavigate();

  // Access
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Data
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [publishedEvents, setPublishedEvents] = useState<Event[]>([]);
  const [unpublishedEvents, setUnpublishedEvents] = useState<Event[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<Event[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Stats
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  // UI
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [confirmDeleteEventId, setConfirmDeleteEventId] = useState<string | null>(null);
  const [shareCardEvent, setShareCardEvent] = useState<Event | null>(null);

  // Edit
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // ── Initial load ─────────────────────────────────────────────────────────

  useEffect(() => {
    let isCurrent = true;

    async function checkAccess() {
      try {
        const user = await getCurrentUser();
        if (!isCurrent) return;

        if (!user) { navigate("/admin/login", { replace: true }); return; }

        const admin = await isCurrentUserAdmin();
        if (!isCurrent) return;

        setAdminUser(user);
        setIsAdmin(admin);

        if (admin) {
          setIsLoadingData(true);
          const [pending, published, unpublished, rejected] = await Promise.all([
            getPendingEvents(),
            getApprovedEventsForAdmin(),
            getUnpublishedEvents(),
            getRejectedEvents(),
          ]);

          if (isCurrent) {
            setPendingEvents(pending);
            setPublishedEvents(published);
            setUnpublishedEvents(unpublished);
            setRejectedEvents(rejected);
          }
        }
      } catch (err) {
        if (isCurrent) setErrorMessage(err instanceof Error ? err.message : "Could not check admin access.");
      } finally {
        if (isCurrent) { setIsCheckingAccess(false); setIsLoadingData(false); }
      }
    }

    void checkAccess();
    return () => { isCurrent = false; };
  }, [navigate]);

  // ── Stats — lazy load on first visit ─────────────────────────────────────

  useEffect(() => {
    if (activeTab !== "stats" || stats !== null || isLoadingStats) return;

    let isCurrent = true;
    setIsLoadingStats(true);
    setStatsError("");

    getAdminStats()
      .then((s) => { if (isCurrent) setStats(s); })
      .catch((err) => { if (isCurrent) setStatsError(err instanceof Error ? err.message : "Could not load stats."); })
      .finally(() => { if (isCurrent) setIsLoadingStats(false); });

    return () => { isCurrent = false; };
  }, [activeTab, stats, isLoadingStats]);

  // ── Navigation ────────────────────────────────────────────────────────────

  function goToTab(tab: AdminTab) {
    setActiveTab(tab);
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmDeleteEventId(null);
    setEditingEventId(null);
    setEditForm(null);
  }

  async function handleSignOut() {
    try { await signOut(); navigate("/admin/login", { replace: true }); }
    catch (err) { setErrorMessage(err instanceof Error ? err.message : "Could not sign out."); }
  }

  // ── Edit helpers ──────────────────────────────────────────────────────────

  function startEditing(event: Event) {
    setErrorMessage(""); setSuccessMessage("");
    setEditingEventId(event.id);
    setEditForm(toEditForm(event));
  }

  function cancelEditing() { setEditingEventId(null); setEditForm(null); setErrorMessage(""); }

  function updateEditField<K extends keyof EditFormState>(field: K, value: EditFormState[K]) {
    setEditForm((curr) => curr ? { ...curr, [field]: value } : curr);
  }

  async function saveEdit(event: Event) {
    if (!editForm) return;
    setErrorMessage(""); setSuccessMessage("");

    const validErr = validateEditForm(editForm);
    if (validErr) { setErrorMessage(validErr); return; }

    const input = buildUpdateInput(editForm);

    try {
      setIsSavingEdit(true);
      setUpdatingEventId(event.id);

      const updater = event.status === "pending" ? updatePendingEvent : updateEventForAdmin;
      const updated = await updater(event.id, input);

      // Update the right list
      const update = (list: Event[]) => list.map((e) => (e.id === event.id ? updated : e));
      if (event.status === "pending") setPendingEvents(update);
      else if (event.status === "approved") setPublishedEvents(update);
      else if (event.status === "unpublished") setUnpublishedEvents(update);
      else if (event.status === "rejected") setRejectedEvents(update);

      setEditingEventId(null);
      setEditForm(null);
      setSuccessMessage("Changes saved.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not save changes.");
    } finally {
      setIsSavingEdit(false);
      setUpdatingEventId(null);
    }
  }

  // ── Action handlers ───────────────────────────────────────────────────────

  async function handleApprove(eventId: string) {
    setErrorMessage(""); setSuccessMessage("");
    try {
      setUpdatingEventId(eventId);
      await approveEvent(eventId);
      // Remove from pending or unpublished, it could come from either
      setPendingEvents((c) => c.filter((e) => e.id !== eventId));
      setUnpublishedEvents((c) => c.filter((e) => e.id !== eventId));
      // Refresh published list
      const published = await getApprovedEventsForAdmin();
      setPublishedEvents(published);
      setSuccessMessage("Event approved — it is now live.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not approve this event.");
    } finally { setUpdatingEventId(null); }
  }

  async function handleReject(eventId: string) {
    setErrorMessage(""); setSuccessMessage("");
    try {
      setUpdatingEventId(eventId);
      await rejectEvent(eventId);
      setPendingEvents((c) => c.filter((e) => e.id !== eventId));
      const rejected = await getRejectedEvents();
      setRejectedEvents(rejected);
      setSuccessMessage("Submission rejected.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not reject this event.");
    } finally { setUpdatingEventId(null); }
  }

  async function handleUnpublish(eventId: string) {
    setErrorMessage(""); setSuccessMessage("");
    try {
      setUpdatingEventId(eventId);
      await unpublishEvent(eventId);
      setPublishedEvents((c) => c.filter((e) => e.id !== eventId));
      const unpublished = await getUnpublishedEvents();
      setUnpublishedEvents(unpublished);
      setSuccessMessage("Event unpublished — it is no longer public.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not unpublish this event.");
    } finally { setUpdatingEventId(null); }
  }

  async function handleRepublish(eventId: string) {
    setErrorMessage(""); setSuccessMessage("");
    try {
      setUpdatingEventId(eventId);
      await republishEvent(eventId);
      setUnpublishedEvents((c) => c.filter((e) => e.id !== eventId));
      const published = await getApprovedEventsForAdmin();
      setPublishedEvents(published);
      setSuccessMessage("Event re-published — it is now live again.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not re-publish this event.");
    } finally { setUpdatingEventId(null); }
  }

  async function handleRestoreToPending(eventId: string) {
    setErrorMessage(""); setSuccessMessage("");
    try {
      setUpdatingEventId(eventId);
      await restoreEventToPending(eventId);
      setRejectedEvents((c) => c.filter((e) => e.id !== eventId));
      const pending = await getPendingEvents();
      setPendingEvents(pending);
      setSuccessMessage("Event moved back to pending — it can be reviewed again.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not restore this event.");
    } finally { setUpdatingEventId(null); }
  }

  async function handleDelete(eventId: string, status: string) {
    setErrorMessage(""); setSuccessMessage("");
    setConfirmDeleteEventId(null);
    try {
      setUpdatingEventId(eventId);
      await deleteEvent(eventId);
      const remove = (c: Event[]) => c.filter((e) => e.id !== eventId);
      if (status === "approved") setPublishedEvents(remove);
      else if (status === "unpublished") setUnpublishedEvents(remove);
      else if (status === "rejected") setRejectedEvents(remove);
      else setPendingEvents(remove);
      setSuccessMessage("Event permanently deleted.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Could not delete this event.");
    } finally { setUpdatingEventId(null); }
  }

  // ── Renders ───────────────────────────────────────────────────────────────

  function renderEventList(events: Event[], emptyTitle: string, emptyMessage: string, renderActions: (e: Event) => React.ReactNode) {
    if (isLoadingData) return <LoadingState />;
    if (events.length === 0) return <EmptyState title={emptyTitle} message={emptyMessage} />;
    return (
      <div className="space-y-5">
        {events.map((event) => {
          const isBusy = updatingEventId === event.id;
          const isEditing = editingEventId === event.id;
          const isConfirmingDelete = confirmDeleteEventId === event.id;

          return (
            <AdminEventCard
              key={event.id}
              event={event}
              showSubmitter
              actions={renderActions(event)}
              editPanel={isEditing && editForm ? (
                <EditPanel
                  form={editForm}
                  isSaving={isSavingEdit}
                  onChange={updateEditField}
                  onCancel={cancelEditing}
                  onSave={() => void saveEdit(event)}
                />
              ) : null}
              confirmPanel={isConfirmingDelete ? (
                <div className="border-2 border-corkRed bg-creamLight p-4 shadow-paste">
                  <p className="font-mono text-xs font-bold text-corkRed uppercase tracking-[0.08em]">Delete permanently?</p>
                  <p className="mt-1 font-mono text-xs text-cacaoMid">This cannot be undone.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AdminBtn variant="danger" onClick={() => void handleDelete(event.id, event.status)} disabled={isBusy}>
                      {isBusy ? "Deleting..." : "Yes, delete"}
                    </AdminBtn>
                    <AdminBtn onClick={() => setConfirmDeleteEventId(null)} disabled={isBusy}>Cancel</AdminBtn>
                  </div>
                </div>
              ) : null}
            />
          );
        })}
      </div>
    );
  }

  // ── Early returns ─────────────────────────────────────────────────────────

  if (isCheckingAccess) {
    return <PageShell title="Admin"><LoadingState message="Checking access..." /></PageShell>;
  }

  if (!isAdmin && errorMessage) {
    return <PageShell title="Admin"><ErrorState message={errorMessage} /></PageShell>;
  }

  if (!isAdmin) {
    return (
      <PageShell eyebrow="Admin" title="Access denied" intro="You are signed in, but this account is not an admin.">
        <div className="max-w-xl border-2 border-ink bg-posterYellow p-5 shadow-poster">
          <p className="font-mono text-sm font-bold text-ink">Ask an existing admin to add your Supabase Auth user ID to public.admin_users.</p>
          <p className="mt-3 break-all border-2 border-ink bg-creamLight p-3 font-mono text-xs font-black text-ink">
            {adminUser?.id ?? "No user id available"}
          </p>
          <button type="button" onClick={handleSignOut} className="button-primary mt-5 bg-ink text-creamLight">
            Sign out
          </button>
        </div>
      </PageShell>
    );
  }

  const tabs: TabDef[] = [
    { id: "overview",    label: "Overview" },
    { id: "pending",     label: "Submissions", count: pendingEvents.length, urgent: true },
    { id: "published",   label: "Published",   count: publishedEvents.length },
    { id: "unpublished", label: "Unpublished",  count: unpublishedEvents.length, urgent: true },
    { id: "rejected",    label: "Rejected",     count: rejectedEvents.length },
    { id: "stats",       label: "Stats" },
  ];

  return (
    <>
      {shareCardEvent ? <ShareCardModal event={shareCardEvent} onClose={() => setShareCardEvent(null)} /> : null}

      <PageShell eyebrow="Admin" title="Dashboard">
        {/* Header bar */}
        <div className="mb-6 flex flex-col gap-3 border-2 border-ink bg-creamLight p-4 shadow-paste sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-corkRed">Signed in</p>
            <p className="break-all font-mono text-xs font-bold text-ink">{adminUser?.email ?? adminUser?.id}</p>
          </div>
          <button type="button" onClick={handleSignOut} className="button-primary bg-ink text-creamLight sm:w-auto">
            Sign out
          </button>
        </div>

        {/* Tab bar */}
        <TabBar tabs={tabs} active={activeTab} onSelect={goToTab} />

        {/* Feedback */}
        {successMessage ? <SuccessBanner message={successMessage} /> : null}
        {errorMessage && activeTab !== "overview" ? (
          <div className="mb-6"><ErrorState message={errorMessage} /></div>
        ) : null}

        {/* ── Tab content ── */}

        {activeTab === "overview" && (
          <OverviewTab
            pending={pendingEvents}
            published={publishedEvents}
            unpublished={unpublishedEvents}
            rejected={rejectedEvents}
            onGoTo={goToTab}
          />
        )}

        {activeTab === "pending" && renderEventList(
          pendingEvents,
          "No pending submissions",
          "Freshly submitted events will appear here for review.",
          (event) => {
            const isBusy = updatingEventId === event.id;
            const isEditing = editingEventId === event.id;
            return (
              <>
                <AdminBtn onClick={() => startEditing(event)} disabled={isBusy || isEditing}>Edit</AdminBtn>
                <AdminBtn variant="primary" onClick={() => void handleApprove(event.id)} disabled={isBusy || isEditing}>
                  {isBusy ? "Working..." : "Approve"}
                </AdminBtn>
                <AdminBtn variant="danger" onClick={() => void handleReject(event.id)} disabled={isBusy || isEditing}>
                  {isBusy ? "Working..." : "Reject"}
                </AdminBtn>
              </>
            );
          },
        )}

        {activeTab === "published" && renderEventList(
          publishedEvents,
          "No published events",
          "Events you approve will appear here.",
          (event) => {
            const isBusy = updatingEventId === event.id;
            const isEditing = editingEventId === event.id;
            const isConfirming = confirmDeleteEventId === event.id;
            return (
              <>
                <AdminBtn onClick={() => setShareCardEvent(event)} disabled={isBusy || isEditing || isConfirming}>Share card</AdminBtn>
                <AdminBtn onClick={() => startEditing(event)} disabled={isBusy || isEditing || isConfirming}>Edit</AdminBtn>
                <AdminBtn onClick={() => void handleUnpublish(event.id)} disabled={isBusy || isEditing || isConfirming}>
                  {isBusy ? "Working..." : "Unpublish"}
                </AdminBtn>
                <AdminBtn variant="danger" onClick={() => setConfirmDeleteEventId(event.id)} disabled={isBusy || isEditing || isConfirming}>
                  Delete
                </AdminBtn>
              </>
            );
          },
        )}

        {activeTab === "unpublished" && renderEventList(
          unpublishedEvents,
          "No unpublished events",
          "Events removed from public view will appear here. You can re-publish them at any time.",
          (event) => {
            const isBusy = updatingEventId === event.id;
            const isEditing = editingEventId === event.id;
            const isConfirming = confirmDeleteEventId === event.id;
            return (
              <>
                <AdminBtn onClick={() => startEditing(event)} disabled={isBusy || isEditing || isConfirming}>Edit</AdminBtn>
                <AdminBtn variant="primary" onClick={() => void handleRepublish(event.id)} disabled={isBusy || isEditing || isConfirming}>
                  {isBusy ? "Working..." : "Re-publish"}
                </AdminBtn>
                <AdminBtn variant="danger" onClick={() => setConfirmDeleteEventId(event.id)} disabled={isBusy || isEditing || isConfirming}>
                  Delete
                </AdminBtn>
              </>
            );
          },
        )}

        {activeTab === "rejected" && renderEventList(
          rejectedEvents,
          "No rejected events",
          "Events you reject will be kept here. You can move them back to pending if needed.",
          (event) => {
            const isBusy = updatingEventId === event.id;
            const isConfirming = confirmDeleteEventId === event.id;
            return (
              <>
                <AdminBtn onClick={() => void handleRestoreToPending(event.id)} disabled={isBusy || isConfirming}>
                  {isBusy ? "Working..." : "Back to pending"}
                </AdminBtn>
                <AdminBtn variant="danger" onClick={() => setConfirmDeleteEventId(event.id)} disabled={isBusy || isConfirming}>
                  Delete
                </AdminBtn>
              </>
            );
          },
        )}

        {activeTab === "stats" && (
          <StatsTab stats={stats} isLoading={isLoadingStats} error={statsError} />
        )}
      </PageShell>
    </>
  );
}

// ── Edit panel ─────────────────────────────────────────────────────────────

type EditPanelProps = {
  form: EditFormState;
  isSaving: boolean;
  onChange: <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => void;
  onCancel: () => void;
  onSave: () => void;
};

function EditPanel({ form, isSaving, onChange, onCancel, onSave }: EditPanelProps) {
  const isManualVenue = form.venue_id === null;

  return (
    <div className="mt-5 border-2 border-ink bg-paper p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-xl font-black text-ink min-[360px]:text-2xl">Edit event</h3>
        <span className="w-fit border-2 border-ink bg-posterYellow px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink">
          Unsaved
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <EditField label="Event title" required>
          <input required className="form-input bg-creamLight" value={form.title} onChange={(e) => onChange("title", e.target.value)} />
        </EditField>
        <EditField label="Date" required>
          <input required type="date" className="form-input bg-creamLight" value={form.event_date} onChange={(e) => onChange("event_date", e.target.value)} />
        </EditField>
        <EditField label="Start time" required>
          <input required type="time" className="form-input bg-creamLight" value={form.start_time} onChange={(e) => onChange("start_time", e.target.value)} />
        </EditField>
        <EditField label="End time">
          <input type="time" className="form-input bg-creamLight" value={form.end_time} onChange={(e) => onChange("end_time", e.target.value)} />
        </EditField>
        <VenueAutocomplete
          required
          value={form.venue}
          selectedVenueId={form.venue_id}
          onChange={(venueName, venueId) => {
            onChange("venue", venueName);
            onChange("venue_id", venueId);
            if (venueId !== null) onChange("manual_maps_url", "");
          }}
          inputClassName="form-input bg-creamLight"
        />
        {isManualVenue && form.venue.trim() ? (
          <EditField label="Maps link">
            <input type="url" className="form-input bg-creamLight" value={form.manual_maps_url} onChange={(e) => onChange("manual_maps_url", e.target.value)} placeholder="https://maps.google.com/..." />
          </EditField>
        ) : null}
        <OrganiserAutocomplete
          required
          value={form.organiser}
          selectedOrganiserId={form.organiser_id}
          onChange={(organiserName, organiserId) => { onChange("organiser", organiserName); onChange("organiser_id", organiserId); }}
          inputClassName="form-input bg-creamLight"
        />
        <DisciplineChipPicker
          selectedDisciplines={form.disciplines}
          onChange={(d) => onChange("disciplines", d)}
          required
          className="md:col-span-2"
        />
        <EditField label="Entry fee">
          <input className="form-input bg-creamLight" value={form.entry_fee} onChange={(e) => onChange("entry_fee", e.target.value)} placeholder="Free entry, €10, Pay what you can…" />
        </EditField>
        <EditField label="Links or booking info">
          <input className="form-input bg-creamLight" value={form.link_or_ticket_info} onChange={(e) => onChange("link_or_ticket_info", e.target.value)} />
        </EditField>
        <EditField label="Image URL">
          <input type="url" className="form-input bg-creamLight" value={form.image_url} onChange={(e) => onChange("image_url", e.target.value)} />
        </EditField>
        <EditField label="Submitter name">
          <input className="form-input bg-creamLight" value={form.submitter_name} onChange={(e) => onChange("submitter_name", e.target.value)} />
        </EditField>
        <EditField label="Submitter email">
          <input type="email" className="form-input bg-creamLight" value={form.submitter_email} onChange={(e) => onChange("submitter_email", e.target.value)} />
        </EditField>
        <EditField label="Description" className="md:col-span-2">
          <textarea className="form-input min-h-28 resize-y bg-creamLight" value={form.description} onChange={(e) => onChange("description", e.target.value)} />
        </EditField>
        <EditField label="Admin notes" className="md:col-span-2">
          <textarea className="form-input min-h-20 resize-y bg-creamLight" value={form.admin_notes} onChange={(e) => onChange("admin_notes", e.target.value)} />
        </EditField>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <AdminBtn variant="primary" onClick={onSave} disabled={isSaving}>{isSaving ? "Saving..." : "Save changes"}</AdminBtn>
        <AdminBtn onClick={onCancel} disabled={isSaving}>Cancel</AdminBtn>
      </div>
    </div>
  );
}

type EditFieldProps = {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

function EditField({ label, required = false, className = "", children }: EditFieldProps) {
  return (
    <label className={`space-y-1.5 ${className}`}>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
        {label}{required ? <span className="text-corkRed"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
