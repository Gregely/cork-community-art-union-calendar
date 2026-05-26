import { FormEvent, ReactNode, useState } from "react";
import { OrganiserAutocomplete } from "./OrganiserAutocomplete";
import { VenueAutocomplete } from "./VenueAutocomplete";
import { submitEvent } from "../../lib/eventMutations";
import { disciplines } from "../../types/event";
import type { Discipline, EventInsert } from "../../types/event";

type SubmissionFormState = {
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  venue_id: string | null;
  venue: string;
  organiser_id: string | null;
  organiser: string;
  discipline: "" | Discipline;
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
  organiser_id: null,
  organiser: "",
  discipline: "",
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
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  }

  function updateVenue(venueName: string, venueId: string | null) {
    setFormState((currentState) => ({
      ...currentState,
      venue: venueName,
      venue_id: venueId,
    }));
  }

  function updateOrganiser(organiserName: string, organiserId: string | null) {
    setFormState((currentState) => ({
      ...currentState,
      organiser: organiserName,
      organiser_id: organiserId,
    }));
  }

  function getTodayLocalDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function validateForm() {
    const requiredFields: Array<[Exclude<keyof SubmissionFormState, "venue_id" | "organiser_id">, string]> = [
      ["title", "Event title is required."],
      ["event_date", "Event date is required."],
      ["start_time", "Start time is required."],
      ["venue", "Venue is required."],
      ["organiser", "Organiser is required."],
      ["discipline", "Discipline is required."],
      ["link_or_ticket_info", "Link or ticket info is required."],
    ];

    for (const [field, message] of requiredFields) {
      if (!formState[field].trim()) {
        return message;
      }
    }

    if (formState.event_date < getTodayLocalDate()) {
      return "Event date cannot be in the past.";
    }

    if (formState.submitter_email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(formState.submitter_email.trim())) {
        return "Submitter email should look like name@example.com.";
      }
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const input: EventInsert = {
      title: formState.title.trim(),
      event_date: formState.event_date,
      start_time: formState.start_time,
      end_time: formState.end_time || null,
      venue_id: formState.venue_id,
      venue: formState.venue.trim(),
      organiser_id: formState.organiser_id,
      organiser: formState.organiser.trim(),
      discipline: formState.discipline,
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
      setFormState((currentState) => ({
        ...initialFormState,
        organiser: currentState.organiser,
        submitter_name: currentState.submitter_name,
        submitter_email: currentState.submitter_email,
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

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-ink bg-white p-5 shadow-poster sm:p-6">
      {successMessage ? (
        <div className="mb-5 rounded-2xl border-2 border-ink bg-grass p-4 text-sm font-bold text-white">
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mb-5 rounded-2xl border-2 border-ink bg-corkRed p-4 text-sm font-bold text-white">
          {errorMessage}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Event title" required>
          <input
            required
            name="title"
            value={formState.title}
            onChange={(event) => updateField("title", event.target.value)}
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
            onChange={(event) => updateField("event_date", event.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="Start time" required>
          <input
            required
            name="start_time"
            type="time"
            value={formState.start_time}
            onChange={(event) => updateField("start_time", event.target.value)}
            className="form-input"
          />
        </Field>
        <Field label="End time">
          <input
            name="end_time"
            type="time"
            value={formState.end_time}
            onChange={(event) => updateField("end_time", event.target.value)}
            className="form-input"
          />
        </Field>
        <VenueAutocomplete
          required
          value={formState.venue}
          selectedVenueId={formState.venue_id}
          onChange={updateVenue}
        />
        <OrganiserAutocomplete
          required
          value={formState.organiser}
          selectedOrganiserId={formState.organiser_id}
          onChange={updateOrganiser}
        />
        <Field label="Discipline" required>
          <select
            required
            name="discipline"
            value={formState.discipline}
            onChange={(event) => updateField("discipline", event.target.value)}
            className="form-input"
          >
            <option value="">Choose one</option>
            {disciplines.map((discipline) => (
              <option key={discipline} value={discipline}>
                {discipline}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Link or ticket info" required>
          <input
            required
            name="link_or_ticket_info"
            value={formState.link_or_ticket_info}
            onChange={(event) => updateField("link_or_ticket_info", event.target.value)}
            className="form-input"
            placeholder="URL, email, free entry, or door price"
          />
        </Field>
        <Field label="Image URL">
          <input
            name="image_url"
            type="url"
            value={formState.image_url}
            onChange={(event) => updateField("image_url", event.target.value)}
            className="form-input"
            placeholder="https://..."
          />
        </Field>
        <Field label="Submitter name">
          <input
            name="submitter_name"
            value={formState.submitter_name}
            onChange={(event) => updateField("submitter_name", event.target.value)}
            className="form-input"
            placeholder="Optional"
          />
        </Field>
        <Field label="Submitter email">
          <input
            name="submitter_email"
            type="email"
            value={formState.submitter_email}
            onChange={(event) => updateField("submitter_email", event.target.value)}
            className="form-input"
            placeholder="For moderation questions"
          />
        </Field>
        <Field label="Short description" className="md:col-span-2">
          <textarea
            name="description"
            value={formState.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="form-input min-h-32 resize-y"
            placeholder="A few friendly lines about the event."
          />
        </Field>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-full border-2 border-ink bg-corkRed px-6 py-4 text-base font-black text-white shadow-poster transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? "Submitting..." : "Submit for approval"}
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
    <label className={`space-y-2 text-sm font-black ${className}`}>
      <span>
        {label}
        {required ? <span className="text-corkRed"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
