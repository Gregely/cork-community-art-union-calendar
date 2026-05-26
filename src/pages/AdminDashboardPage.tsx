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
import { approveEvent, deleteEvent, getApprovedEventsForAdmin, getPendingEvents, rejectEvent, unpublishEvent, updatePendingEvent } from "../lib/adminEventQueries";
import { getCurrentUser, isCurrentUserAdmin, signOut } from "../lib/auth";
import type { Event, EventUpdate } from "../types/event";
import { getEventDisciplines } from "../types/event";
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
  disciplines: string[];
  manual_maps_url: string;
  description: string;
  link_or_ticket_info: string;
  image_url: string;
  submitter_name: string;
  submitter_email: string;
  admin_notes: string;
};

type AdminTab = "pending" | "approved";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("pending");
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<Event[]>([]);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingApproved, setIsLoadingApproved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [updatingEventId, setUpdatingEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [confirmDeleteEventId, setConfirmDeleteEventId] = useState<string | null>(null);
  const [shareCardEvent, setShareCardEvent] = useState<Event | null>(null);

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
          setIsLoadingApproved(true);
          const [submissions, approved] = await Promise.all([
            getPendingEvents(),
            getApprovedEventsForAdmin(),
          ]);

          if (isCurrent) {
            setPendingEvents(submissions);
            setApprovedEvents(approved);
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
          setIsLoadingApproved(false);
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
      setPendingEvents((curr) => curr.filter((e) => e.id !== eventId));
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
      setPendingEvents((curr) => curr.filter((e) => e.id !== eventId));
      setSuccessMessage("Event rejected. It will stay off the public calendar.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not reject this event.");
    } finally {
      setUpdatingEventId(null);
    }
  }

  async function handleUnpublish(eventId: string) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      setUpdatingEventId(eventId);
      await unpublishEvent(eventId);
      setApprovedEvents((curr) => curr.filter((e) => e.id !== eventId));
      setSuccessMessage("Event unpublished. It is no longer public.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not unpublish this event.");
    } finally {
      setUpdatingEventId(null);
    }
  }

  async function handleDelete(eventId: string) {
    setErrorMessage("");
    setSuccessMessage("");
    setConfirmDeleteEventId(null);

    try {
      setUpdatingEventId(eventId);
      await deleteEvent(eventId);
      setApprovedEvents((curr) => curr.filter((e) => e.id !== eventId));
      setSuccessMessage("Event permanently deleted.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete this event. It may be linked to other records.");
    } finally {
      setUpdatingEventId(null);
    }
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
    setEditForm((curr) => curr ? { ...curr, [field]: value } : curr);
  }

  function validateEditForm(form: EditFormState) {
    if (!form.title.trim()) return "Event title is required.";
    if (!form.event_date) return "Event date is required.";
    if (!form.start_time) return "Start time is required.";
    if (!form.venue.trim()) return "Venue is required.";
    if (!form.organiser.trim()) return "Organiser is required.";
    if (form.disciplines.length === 0) return "At least one discipline is required.";
    if (!form.link_or_ticket_info.trim()) return "Link or ticket info is required.";

    if (form.event_date < getTodayForInput()) {
      return "Event date cannot be in the past.";
    }

    if (form.submitter_email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(form.submitter_email.trim())) {
        return "Submitter email should look like name@example.com.";
      }
    }

    if (form.manual_maps_url.trim()) {
      try {
        new URL(form.manual_maps_url.trim());
      } catch {
        return "Maps link must be a valid URL.";
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
      discipline: editForm.disciplines[0] ?? "",
      disciplines: editForm.disciplines,
      manual_maps_url: editForm.venue_id ? null : (editForm.manual_maps_url.trim() || null),
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
      setPendingEvents((curr) =>
        curr.map((e) => (e.id === eventId ? updatedEvent : e)),
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
    <>
    {shareCardEvent ? (
      <ShareCardModal event={shareCardEvent} onClose={() => setShareCardEvent(null)} />
    ) : null}
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
      <div className="mb-6 grid gap-2 min-[360px]:grid-cols-2">
        <Link to="/admin" className="button-primary bg-ink text-paper">Moderation</Link>
        <Link to="/admin/data" className="button-primary bg-white text-ink">Manage venues/organisers</Link>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => { setActiveTab("pending"); setErrorMessage(""); setSuccessMessage(""); setConfirmDeleteEventId(null); }}
          className={`min-h-11 rounded-full border-2 border-ink px-4 py-2 text-sm font-black ${activeTab === "pending" ? "bg-ink text-paper" : "bg-white text-ink hover:bg-posterYellow"}`}
        >
          Pending{pendingEvents.length > 0 ? ` (${pendingEvents.length})` : ""}
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("approved"); setErrorMessage(""); setSuccessMessage(""); setConfirmDeleteEventId(null); }}
          className={`min-h-11 rounded-full border-2 border-ink px-4 py-2 text-sm font-black ${activeTab === "approved" ? "bg-ink text-paper" : "bg-white text-ink hover:bg-posterYellow"}`}
        >
          Approved{approvedEvents.length > 0 ? ` (${approvedEvents.length})` : ""}
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

      {/* Approved tab */}
      {activeTab === "approved" ? (
        <section className="space-y-5">
          {isLoadingApproved ? <LoadingState message="Loading approved events..." /> : null}
          {!isLoadingApproved && approvedEvents.length === 0 ? (
            <EmptyState
              title="No approved events"
              message="Events you approve will appear here."
            />
          ) : null}
          {!isLoadingApproved && approvedEvents.length > 0
            ? approvedEvents.map((event) => {
                const isPast = event.event_date < getTodayForInput();
                const isConfirmingDelete = confirmDeleteEventId === event.id;
                const isBusy = updatingEventId === event.id;
                const eventDisciplines = getEventDisciplines(event);

                return (
                  <article key={event.id} className="rounded-2xl border-2 border-ink bg-white p-4 shadow-poster sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {eventDisciplines.map((d) => (
                            <DisciplineBadge key={d} discipline={d} />
                          ))}
                          {isPast ? (
                            <span className="inline-flex items-center rounded-full border-2 border-ink bg-stone-200 px-3 py-1 text-xs font-black uppercase">
                              Past event
                            </span>
                          ) : null}
                        </div>
                        <div>
                          <h2 className="font-display text-2xl font-black min-[360px]:text-3xl">{event.title}</h2>
                          <p className="mt-2 text-sm font-bold text-leeBlue">
                            {formatDate(event.event_date)} at {formatTimeRange(event.start_time, event.end_time)}
                          </p>
                        </div>
                        <p className="text-sm">
                          <span className="font-black">Venue:</span> {event.venue}
                        </p>
                        <p className="text-sm">
                          <span className="font-black">Organiser:</span> {event.organiser}
                        </p>
                        <p className="text-sm">
                          <span className="font-black">Link/ticket info:</span> {event.link_or_ticket_info}
                        </p>
                        {isConfirmingDelete ? (
                          <div className="rounded-xl border-2 border-corkRed bg-red-50 p-3">
                            <p className="text-sm font-black text-corkRed">Delete this event permanently?</p>
                            <p className="mt-1 text-xs text-stone-700">This cannot be undone. The event record will be gone forever.</p>
                            <div className="mt-3 flex flex-col gap-2 min-[360px]:flex-row">
                              <button
                                type="button"
                                onClick={() => void handleDelete(event.id)}
                                disabled={isBusy}
                                className="min-h-10 rounded-full border-2 border-corkRed bg-corkRed px-4 py-2 text-sm font-black text-white disabled:opacity-60"
                              >
                                {isBusy ? "Deleting..." : "Yes, delete forever"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteEventId(null)}
                                disabled={isBusy}
                                className="min-h-10 rounded-full border-2 border-ink bg-white px-4 py-2 text-sm font-black disabled:opacity-60"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="grid w-full grid-cols-1 gap-3 min-[360px]:grid-cols-2 lg:w-48 lg:grid-cols-1">
                        <button
                          type="button"
                          onClick={() => setShareCardEvent(event)}
                          disabled={isBusy || isConfirmingDelete}
                          className="min-h-11 rounded-full border-2 border-ink bg-white px-4 py-3 text-sm font-black text-ink disabled:cursor-not-allowed disabled:opacity-60 hover:bg-posterYellow"
                        >
                          Share card
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleUnpublish(event.id)}
                          disabled={isBusy || isConfirmingDelete}
                          className="min-h-11 rounded-full border-2 border-ink bg-posterYellow px-4 py-3 text-sm font-black text-ink disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isBusy && !isConfirmingDelete ? "Working..." : "Unpublish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteEventId(event.id)}
                          disabled={isBusy || isConfirmingDelete}
                          className="min-h-11 rounded-full border-2 border-corkRed bg-white px-4 py-3 text-sm font-black text-corkRed disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            : null}
        </section>
      ) : null}

      {/* Pending tab */}
      <section className={`space-y-5 ${activeTab === "pending" ? "" : "hidden"}`}>
        {isLoadingEvents ? <LoadingState message="Loading pending submissions..." /> : null}
        {!isLoadingEvents && pendingEvents.length === 0 ? (
          <EmptyState
            title="No pending submissions right now"
            message="Freshly submitted events will appear here for review before they go public."
          />
        ) : null}
        {!isLoadingEvents && pendingEvents.length > 0 ? (
          pendingEvents.map((event) => {
            const eventDisciplines = getEventDisciplines(event);
            return (
              <article key={event.id} className="rounded-2xl border-2 border-ink bg-white p-4 shadow-poster sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {eventDisciplines.map((d) => (
                        <DisciplineBadge key={d} discipline={d} />
                      ))}
                    </div>
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
                    {event.manual_maps_url ? (
                      <p className="break-all text-sm">
                        <span className="font-black">Maps link:</span> {event.manual_maps_url}
                      </p>
                    ) : null}
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
            );
          })
        ) : null}
      </section>
    </PageShell>
    </>
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
  const isManualVenue = form.venue_id === null;

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
            onChange={(e) => onChange("title", e.target.value)}
          />
        </EditField>
        <EditField label="Date" required>
          <input
            required
            type="date"
            min={getTodayForInput()}
            className="form-input bg-white"
            value={form.event_date}
            onChange={(e) => onChange("event_date", e.target.value)}
          />
        </EditField>
        <EditField label="Start time" required>
          <input
            required
            type="time"
            className="form-input bg-white"
            value={form.start_time}
            onChange={(e) => onChange("start_time", e.target.value)}
          />
        </EditField>
        <EditField label="End time">
          <input
            type="time"
            className="form-input bg-white"
            value={form.end_time}
            onChange={(e) => onChange("end_time", e.target.value)}
          />
        </EditField>
        <VenueAutocomplete
          required
          value={form.venue}
          selectedVenueId={form.venue_id}
          onChange={(venueName, venueId) => {
            onChange("venue", venueName);
            onChange("venue_id", venueId);
            // Clear manual maps URL when a saved venue is selected
            if (venueId !== null) onChange("manual_maps_url", "");
          }}
          inputClassName="form-input bg-white"
        />
        {/* Maps link — only when no saved venue */}
        {isManualVenue && form.venue.trim() ? (
          <EditField label="Maps link">
            <input
              type="url"
              className="form-input bg-white"
              value={form.manual_maps_url}
              onChange={(e) => onChange("manual_maps_url", e.target.value)}
              placeholder="https://maps.google.com/..."
            />
          </EditField>
        ) : null}
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
        <DisciplineChipPicker
          selectedDisciplines={form.disciplines}
          onChange={(disciplines) => onChange("disciplines", disciplines)}
          required
          className="md:col-span-2"
        />
        <EditField label="Link or ticket info" required>
          <input
            required
            className="form-input bg-white"
            value={form.link_or_ticket_info}
            onChange={(e) => onChange("link_or_ticket_info", e.target.value)}
          />
        </EditField>
        <EditField label="Image URL">
          <input
            type="url"
            className="form-input bg-white"
            value={form.image_url}
            onChange={(e) => onChange("image_url", e.target.value)}
          />
        </EditField>
        <EditField label="Submitter name">
          <input
            className="form-input bg-white"
            value={form.submitter_name}
            onChange={(e) => onChange("submitter_name", e.target.value)}
          />
        </EditField>
        <EditField label="Submitter email">
          <input
            type="email"
            className="form-input bg-white"
            value={form.submitter_email}
            onChange={(e) => onChange("submitter_email", e.target.value)}
          />
        </EditField>
        <EditField label="Short description" className="md:col-span-2">
          <textarea
            className="form-input min-h-28 resize-y bg-white"
            value={form.description}
            onChange={(e) => onChange("description", e.target.value)}
          />
        </EditField>
        <EditField label="Admin notes" className="md:col-span-2">
          <textarea
            className="form-input min-h-24 resize-y bg-white"
            value={form.admin_notes}
            onChange={(e) => onChange("admin_notes", e.target.value)}
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
