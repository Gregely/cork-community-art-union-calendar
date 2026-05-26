import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DisciplineBadge } from "../components/events/DisciplineBadge";
import { OrganiserAutocomplete } from "../components/forms/OrganiserAutocomplete";
import { VenueAutocomplete } from "../components/forms/VenueAutocomplete";
import { PageShell } from "../components/layout/PageShell";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import { LoadingState } from "../components/shared/LoadingState";
import { approveEvent, getPendingEvents, rejectEvent, updatePendingEvent } from "../lib/adminEventQueries";
import { getCurrentUser, isCurrentUserAdmin, signOut } from "../lib/auth";
import { disciplines } from "../types/event";
import type { Discipline, Event, EventUpdate } from "../types/event";
import { formatDate, formatDateTime, formatTimeRange } from "../utils/date";

type EditFormState = {
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_id: string | null;
  venue: string;
  organiser_id: string | null;
  organiser: string;
  discipline: string;
  description: string;
  link_or_ticket_info: string;
  image_url: string;
  submitter_name: string;
  submitter_email: string;
  admin_notes: string;
};

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    async function checkAccess() {
      try {
        const user = await getCurrentUser();

        if (!isCurrent) return;

        if (!user) {
          navigate("/admin/login", { replace: true });
          return;
        }

        const admin = await isCurrentUserAdmin();

        if (!isCurrent) return;

        setAdminUser(user);
        setIsAdmin(admin);

        if (admin) {
          setIsLoadingEvents(true);
          const submissions = await getPendingEvents();

          if (isCurrent) {
            setPendingEvents(submissions);
          }
        }
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(error instanceof Error ? error.message : "Could not check admin access.");
        }
      } finally {
        if (isCurrent) {
          setIsCheckingAccess(false);
          setIsLoadingEvents(false);
        }
      }
    }

    void checkAccess();

    return () => {
      isCurrent = false;
    };
  }, [navigate]);

  async function handleSignOut() {
    try {
      await signOut();
      navigate("/admin/login", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  async function handleApprove(eventId: string) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setUpdatingEventId(eventId);
      await approveEvent(eventId);
      setPendingEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
      setSuccessMessage("Event approved. It is now public.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not approve this event.");
    } finally {
      setUpdatingEventId(null);
    }
  }

  async function handleReject(eventId: string) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setUpdatingEventId(eventId);
      await rejectEvent(eventId);
      setPendingEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
      setSuccessMessage("Event rejected. It will stay off the public calendar.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not reject this event.");
    } finally {
      setUpdatingEventId(null);
    }
  }

  function getTodayLocalDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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
      discipline: event.discipline,
      description: event.description ?? "",
      link_or_ticket_info: event.link_or_ticket_info,
      image_url: event.image_url ?? "",
      submitter_name: event.submitter_name ?? "",
      submitter_email: event.submitter_email ?? "",
      admin_notes: event.admin_notes ?? "",
    };
  }

  function startEditing(event: Event) {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingEventId(event.id);
    setEditForm(toEditForm(event));
  }

  function cancelEditing() {
    setEditingEventId(null);
    setEditForm(null);
    setErrorMessage("");
  }

  function updateEditField<K extends keyof EditFormState>(field: K, value: EditFormState[K]) {
    setEditForm((currentForm) => currentForm ? { ...currentForm, [field]: value } : currentForm);
  }

  function validateEditForm(form: EditFormState) {
    const requiredFields: Array<[Exclude<keyof EditFormState, "venue_id" | "organiser_id">, string]> = [
      ["title", "Event title is required."],
      ["event_date", "Event date is required."],
      ["start_time", "Start time is required."],
      ["venue", "Venue is required."],
      ["organiser", "Organiser is required."],
      ["discipline", "Discipline is required."],
      ["link_or_ticket_info", "Link or ticket info is required."],
    ];

    for (const [field, message] of requiredFields) {
      if (!form[field].trim()) {
        return message;
      }
    }

    if (form.event_date < getTodayLocalDate()) {
      return "Event date cannot be in the past.";
    }

    if (form.submitter_email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(form.submitter_email.trim())) {
        return "Submitter email should look like name@example.com.";
      }
    }

    return "";
  }

  async function saveEdit(eventId: string) {
    if (!editForm) return;

    setErrorMessage("");
    setSuccessMessage("");

    const validationMessage = validateEditForm(editForm);

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const input: EventUpdate = {
      title: editForm.title.trim(),
      event_date: editForm.event_date,
      start_time: editForm.start_time,
      end_time: editForm.end_time || null,
      venue_id: editForm.venue_id,
      venue: editForm.venue.trim(),
      organiser_id: editForm.organiser_id,
      organiser: editForm.organiser.trim(),
      discipline: editForm.discipline.trim(),
      description: editForm.description.trim() || null,
      link_or_ticket_info: editForm.link_or_ticket_info.trim(),
      image_url: editForm.image_url.trim() || null,
      submitter_name: editForm.submitter_name.trim() || null,
      submitter_email: editForm.submitter_email.trim() || null,
      admin_notes: editForm.admin_notes.trim() || null,
    };

    try {
      setIsSavingEdit(true);
      setUpdatingEventId(eventId);
      const updatedEvent = await updatePendingEvent(eventId, input);
      setPendingEvents((currentEvents) =>
        currentEvents.map((event) => (event.id === eventId ? updatedEvent : event)),
      );
      setEditingEventId(null);
      setEditForm(null);
      setSuccessMessage("Changes saved. This submission is still pending.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save changes.");
    } finally {
      setIsSavingEdit(false);
      setUpdatingEventId(null);
    }
  }

  if (isCheckingAccess) {
    return (
      <PageShell title="Checking admin access">
        <LoadingState message="Checking admin access..." />
      </PageShell>
    );
  }

  if (errorMessage) {
    return (
      <PageShell title="Admin access">
        <ErrorState message={errorMessage} />
      </PageShell>
    );
  }

  if (!isAdmin) {
    return (
      <PageShell
        eyebrow="Admin"
        title="Access denied"
        intro="You are signed in, but this account is not an admin."
      >
        <div className="max-w-xl rounded-2xl border-2 border-ink bg-posterYellow p-4 shadow-poster sm:p-6">
          <p className="font-bold">
            Ask an existing admin to add this Supabase Auth user id to public.admin_users.
          </p>
          <p className="mt-3 break-all rounded-xl border-2 border-ink bg-white p-3 text-xs font-black sm:text-sm">
            {adminUser?.id ?? "No user id available"}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="button-primary mt-5 bg-ink text-paper"
          >
            Sign out
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Moderation"
      title="Admin dashboard"
      intro="Review pending event submissions. Approve in one click, or reject listings that should stay off the public calendar."
    >
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border-2 border-ink bg-white p-4 shadow-poster sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-corkRed">Signed in admin</p>
          <p className="break-all text-sm font-bold">{adminUser?.email ?? adminUser?.id}</p>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="min-h-11 rounded-full border-2 border-ink bg-paper px-4 py-2 text-sm font-black focus:outline-none focus:ring-4 focus:ring-posterYellow"
        >
          Sign out
        </button>
      </div>
      {successMessage ? (
        <div className="mb-6 rounded-2xl border-2 border-ink bg-grass p-4 text-sm font-black text-white shadow-poster">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mb-6">
          <ErrorState message={errorMessage} />
        </div>
      ) : null}
      <section className="space-y-5">
        {isLoadingEvents ? <LoadingState message="Loading pending submissions..." /> : null}
        {!isLoadingEvents && pendingEvents.length === 0 ? (
          <EmptyState
            title="No pending submissions right now"
            message="Freshly submitted events will appear here for review before they go public."
          />
        ) : null}
        {!isLoadingEvents && pendingEvents.length > 0 ? (
          pendingEvents.map((event) => (
            <article key={event.id} className="rounded-2xl border-2 border-ink bg-white p-4 shadow-poster sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-3">
                  <DisciplineBadge discipline={event.discipline} />
                  <div>
                    <h2 className="font-display text-2xl font-black min-[360px]:text-3xl">{event.title}</h2>
                    <p className="mt-2 text-sm font-bold text-leeBlue">
                      {formatDate(event.event_date)} at{" "}
                      {formatTimeRange(event.start_time, event.end_time)}
                    </p>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-stone-700">
                    {event.description || "No description supplied."}
                  </p>
                  <p className="text-sm">
                    <span className="font-black">Venue:</span> {event.venue}
                    {event.venue_id ? <span className="ml-2 text-xs font-bold text-grass">(saved venue)</span> : null}
                  </p>
                  <p className="text-sm">
                    <span className="font-black">Organiser:</span> {event.organiser}
                    {event.organiser_id ? <span className="ml-2 text-xs font-bold text-grass">(saved organiser)</span> : null}
                  </p>
                  <p className="text-sm">
                    <span className="font-black">Link/ticket info:</span> {event.link_or_ticket_info}
                  </p>
                  {event.image_url ? (
                    <p className="break-all text-sm">
                      <span className="font-black">Image URL:</span> {event.image_url}
                    </p>
                  ) : null}
                  {event.submitter_name ? (
                    <p className="text-sm">
                      <span className="font-black">Submitter:</span> {event.submitter_name}
                    </p>
                  ) : null}
                  {event.submitter_email ? (
                    <p className="break-all text-sm">
                      <span className="font-black">Submitter email:</span> {event.submitter_email}
                    </p>
                  ) : null}
                  {event.admin_notes ? (
                    <p className="text-sm">
                      <span className="font-black">Admin notes:</span> {event.admin_notes}
                    </p>
                  ) : null}
                  <p className="text-sm">
                    <span className="font-black">Submitted:</span> {formatDateTime(event.created_at)}
                  </p>
                  {editingEventId === event.id && editForm ? (
                    <EditPanel
                      form={editForm}
                      isSaving={isSavingEdit}
                      onChange={updateEditField}
                      onCancel={cancelEditing}
                      onSave={() => void saveEdit(event.id)}
                    />
                  ) : null}
                </div>
                <div className="grid w-full grid-cols-1 gap-3 min-[360px]:grid-cols-3 lg:w-48 lg:grid-cols-1">
                  <button
                    type="button"
                    onClick={() => startEditing(event)}
                    disabled={updatingEventId === event.id || editingEventId === event.id}
                    className="min-h-11 rounded-full border-2 border-ink bg-posterYellow px-4 py-3 text-sm font-black text-ink disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleApprove(event.id)}
                    disabled={updatingEventId === event.id || editingEventId === event.id}
                    className="min-h-11 rounded-full border-2 border-ink bg-grass px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatingEventId === event.id ? "Working..." : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReject(event.id)}
                    disabled={updatingEventId === event.id || editingEventId === event.id}
                    className="min-h-11 rounded-full border-2 border-ink bg-corkRed px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatingEventId === event.id ? "Working..." : "Reject"}
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : null}
      </section>
    </PageShell>
  );
}

type EditPanelProps = {
  form: EditFormState;
  isSaving: boolean;
  onChange: <K extends keyof EditFormState>(field: K, value: EditFormState[K]) => void;
  onCancel: () => void;
  onSave: () => void;
};

function EditPanel({ form, isSaving, onChange, onCancel, onSave }: EditPanelProps) {
  return (
    <div className="mt-5 rounded-2xl border-2 border-ink bg-paper p-3 min-[360px]:p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-display text-xl font-black min-[360px]:text-2xl">Edit submission</h3>
        <p className="w-fit rounded-full border-2 border-ink bg-posterYellow px-3 py-1 text-xs font-black uppercase">
          Unsaved changes
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <EditField label="Event title" required>
          <input
            required
            className="form-input bg-white"
            value={form.title}
            onChange={(event) => onChange("title", event.target.value)}
          />
        </EditField>
        <EditField label="Date" required>
          <input
            required
            type="date"
            min={getTodayForInput()}
            className="form-input bg-white"
            value={form.event_date}
            onChange={(event) => onChange("event_date", event.target.value)}
          />
        </EditField>
        <EditField label="Start time" required>
          <input
            required
            type="time"
            className="form-input bg-white"
            value={form.start_time}
            onChange={(event) => onChange("start_time", event.target.value)}
          />
        </EditField>
        <EditField label="End time">
          <input
            type="time"
            className="form-input bg-white"
            value={form.end_time}
            onChange={(event) => onChange("end_time", event.target.value)}
          />
        </EditField>
        <VenueAutocomplete
          required
          value={form.venue}
          selectedVenueId={form.venue_id}
          onChange={(venueName, venueId) => {
            onChange("venue", venueName);
            onChange("venue_id", venueId);
          }}
          inputClassName="form-input bg-white"
        />
        <OrganiserAutocomplete
          required
          value={form.organiser}
          selectedOrganiserId={form.organiser_id}
          onChange={(organiserName, organiserId) => {
            onChange("organiser", organiserName);
            onChange("organiser_id", organiserId);
          }}
          inputClassName="form-input bg-white"
        />
        <EditField label="Discipline" required>
          <select
            required
            className="form-input bg-white"
            value={form.discipline}
            onChange={(event) => onChange("discipline", event.target.value as Discipline)}
          >
            <option value="">Choose one</option>
            {disciplines.map((discipline) => (
              <option key={discipline} value={discipline}>
                {discipline}
              </option>
            ))}
          </select>
        </EditField>
        <EditField label="Link or ticket info" required>
          <input
            required
            className="form-input bg-white"
            value={form.link_or_ticket_info}
            onChange={(event) => onChange("link_or_ticket_info", event.target.value)}
          />
        </EditField>
        <EditField label="Image URL">
          <input
            type="url"
            className="form-input bg-white"
            value={form.image_url}
            onChange={(event) => onChange("image_url", event.target.value)}
          />
        </EditField>
        <EditField label="Submitter name">
          <input
            className="form-input bg-white"
            value={form.submitter_name}
            onChange={(event) => onChange("submitter_name", event.target.value)}
          />
        </EditField>
        <EditField label="Submitter email">
          <input
            type="email"
            className="form-input bg-white"
            value={form.submitter_email}
            onChange={(event) => onChange("submitter_email", event.target.value)}
          />
        </EditField>
        <EditField label="Short description" className="md:col-span-2">
          <textarea
            className="form-input min-h-28 resize-y bg-white"
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
          />
        </EditField>
        <EditField label="Admin notes" className="md:col-span-2">
          <textarea
            className="form-input min-h-24 resize-y bg-white"
            value={form.admin_notes}
            onChange={(event) => onChange("admin_notes", event.target.value)}
          />
        </EditField>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="min-h-11 rounded-full border-2 border-ink bg-grass px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="min-h-11 rounded-full border-2 border-ink bg-white px-5 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-60"
        >
          Cancel
        </button>
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
    <label className={`space-y-2 text-sm font-black ${className}`}>
      <span>
        {label}
        {required ? <span className="text-corkRed"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function getTodayForInput() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
