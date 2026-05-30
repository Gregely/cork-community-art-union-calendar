import { FormEvent, ReactNode, useState } from "react";
import { DisciplineChipPicker } from "./DisciplineChipPicker";
import { OrganiserAutocomplete } from "./OrganiserAutocomplete";
import { VenueAutocomplete } from "./VenueAutocomplete";
import { submitEvent } from "../../lib/eventMutations";
import type { EventInsert } from "../../types/event";

type SubmissionFormState = {
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_id: string | null;
  venue: string;
  manual_maps_url: string;
  organiser_id: string | null;
  organiser: string;
  disciplines: string[];
  entry_fee: string;
  link_or_ticket_info: string;
  image_url: string;
  submitter_name: string;
  submitter_email: string;
  description: string;
};

const initialFormState: SubmissionFormState = {
  title: "",
  event_date: "",
  start_time: "",
  end_time: "",
  venue_id: null,
  venue: "",
  manual_maps_url: "",
  organiser_id: null,
  organiser: "",
  disciplines: [],
  entry_fee: "",
  link_or_ticket_info: "",
  image_url: "",
  submitter_name: "",
  submitter_email: "",
  description: "",
};

export function EventSubmissionForm() {
  const [formState, setFormState] = useState<SubmissionFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(field: keyof SubmissionFormState, value: string) {
    setFormState((curr) => ({ ...curr, [field]: value }));
  }

  function updateVenue(venueName: string, venueId: string | null) {
    setFormState((curr) => ({
      ...curr,
      venue: venueName,
      venue_id: venueId,
      manual_maps_url: venueId !== null ? "" : curr.manual_maps_url,
    }));
  }

  function updateOrganiser(organiserName: string, organiserId: string | null) {
    setFormState((curr) => ({ ...curr, organiser: organiserName, organiser_id: organiserId }));
  }

  function getTodayLocalDate() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }

  function validateForm() {
    if (!formState.title.trim()) return "Event title is required.";
    if (!formState.event_date) return "Event date is required.";
    if (!formState.start_time) return "Start time is required.";
    if (!formState.venue.trim()) return "Venue is required.";
    if (!formState.organiser.trim()) return "Organiser is required.";
    if (formState.disciplines.length === 0) return "At least one discipline is required.";
    if (!formState.entry_fee.trim()) return "Entry fee is required.";

    if (formState.event_date < getTodayLocalDate()) {
      return "Event date cannot be in the past.";
    }

    if (formState.submitter_email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formState.submitter_email.trim())) {
        return "Submitter email should look like name@example.com.";
      }
    }

    if (formState.manual_maps_url.trim()) {
      try { new URL(formState.manual_maps_url.trim()); }
      catch { return "Maps link must be a valid URL (e.g. https://maps.google.com/...)."; }
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const validationMessage = validateForm();
    if (validationMessage) { setErrorMessage(validationMessage); return; }

    const input: EventInsert = {
      title: formState.title.trim(),
      event_date: formState.event_date,
      start_time: formState.start_time,
      end_time: formState.end_time || null,
      venue_id: formState.venue_id,
      venue: formState.venue.trim(),
      organiser_id: formState.organiser_id,
      organiser: formState.organiser.trim(),
      discipline: formState.disciplines[0] ?? "",
      disciplines: formState.disciplines,
      manual_maps_url: formState.venue_id ? null : (formState.manual_maps_url.trim() || null),
      entry_fee: formState.entry_fee.trim(),
      link_or_ticket_info: formState.link_or_ticket_info.trim(),
      image_url: formState.image_url.trim() || null,
      submitter_name: formState.submitter_name.trim() || null,
      submitter_email: formState.submitter_email.trim() || null,
      description: formState.description.trim() || null,
      status: "pending",
    };

    try {
      setIsSubmitting(true);
      await submitEvent(input);
      setSuccessMessage("Thanks — your event has been sent for review.");
      setFormState((curr) => ({
        ...initialFormState,
        organiser: curr.organiser,
        submitter_name: curr.submitter_name,
        submitter_email: curr.submitter_email,
      }));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "We could not submit your event just now. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const isManualVenue = formState.venue_id === null;

  return (
    <form onSubmit={handleSubmit} className="border-2 border-ink bg-creamLight p-5 shadow-poster sm:p-6">
      {successMessage ? (
        <div className="mb-5 border-2 border-grass bg-creamLight p-4 font-mono text-sm font-bold text-grass">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mb-5 border-2 border-corkRed bg-creamLight p-4 font-mono text-sm font-bold text-corkRed">
          {errorMessage}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Event title" required>
          <input
            required
            name="title"
            value={formState.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="form-input"
            placeholder="e.g. Print night at the studio"
          />
        </Field>
        <Field label="Date" required>
          <input
            required
            name="event_date"
            type="date"
            min={getTodayLocalDate()}
            value={formState.event_date}
            onChange={(e) => updateField("event_date", e.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="Start time" required>
          <input
            required
            name="start_time"
            type="time"
            value={formState.start_time}
            onChange={(e) => updateField("start_time", e.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="End time">
          <input
            name="end_time"
            type="time"
            value={formState.end_time}
            onChange={(e) => updateField("end_time", e.target.value)}
            className="form-input"
          />
        </Field>
        <VenueAutocomplete
          required
          value={formState.venue}
          selectedVenueId={formState.venue_id}
          onChange={updateVenue}
        />
        {isManualVenue && formState.venue.trim() ? (
          <Field label="Maps link">
            <input
              name="manual_maps_url"
              type="url"
              value={formState.manual_maps_url}
              onChange={(e) => updateField("manual_maps_url", e.target.value)}
              className="form-input"
              placeholder="https://maps.google.com/..."
            />
            <p className="mt-1 font-mono text-xs text-cacao">
              Optional. Paste a Google or Apple Maps link for this venue.
            </p>
          </Field>
        ) : null}
        <OrganiserAutocomplete
          required
          value={formState.organiser}
          selectedOrganiserId={formState.organiser_id}
          onChange={updateOrganiser}
        />
        <DisciplineChipPicker
          selectedDisciplines={formState.disciplines}
          onChange={(disciplines) => setFormState((curr) => ({ ...curr, disciplines }))}
          required
          className="md:col-span-2"
        />
        <Field label="Entry fee" required>
          <input
            required
            name="entry_fee"
            value={formState.entry_fee}
            onChange={(e) => updateField("entry_fee", e.target.value)}
            className="form-input"
            placeholder="Free entry, €10, Pay what you can, €12 at the door…"
          />
        </Field>
        <Field label="Links or booking info">
          <input
            name="link_or_ticket_info"
            value={formState.link_or_ticket_info}
            onChange={(e) => updateField("link_or_ticket_info", e.target.value)}
            className="form-input"
            placeholder="Website, booking URL, email, or Eventbrite link"
          />
        </Field>
        <Field label="Image URL">
          <input
            name="image_url"
            type="url"
            value={formState.image_url}
            onChange={(e) => updateField("image_url", e.target.value)}
            className="form-input"
            placeholder="https://example.com/poster.jpg"
          />
          <p className="mt-1 font-mono text-xs text-cacao">
            Paste a link to an event poster or image, if you have one.
          </p>
        </Field>
        <Field label="Submitter name">
          <input
            name="submitter_name"
            value={formState.submitter_name}
            onChange={(e) => updateField("submitter_name", e.target.value)}
            className="form-input"
            placeholder="Optional"
          />
        </Field>
        <Field label="Submitter email">
          <input
            name="submitter_email"
            type="email"
            value={formState.submitter_email}
            onChange={(e) => updateField("submitter_email", e.target.value)}
            className="form-input"
            placeholder="For moderation questions"
          />
        </Field>
        <Field label="Short description" className="md:col-span-2">
          <textarea
            name="description"
            value={formState.description}
            onChange={(e) => updateField("description", e.target.value)}
            className="form-input min-h-32 resize-y"
            placeholder="A few friendly lines about the event."
          />
        </Field>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="button-primary mt-6 bg-corkRed text-creamLight disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting…" : "Submit for approval"}
      </button>
    </form>
  );
}

type FieldProps = {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

function Field({ label, required = false, className = "", children }: FieldProps) {
  return (
    <label className={`space-y-2 ${className}`}>
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-ink">
        {label}
        {required ? <span className="text-corkRed"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
