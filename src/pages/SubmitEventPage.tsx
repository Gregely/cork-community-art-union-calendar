import { EventSubmissionForm } from "../components/forms/EventSubmissionForm";
import { PageShell } from "../components/layout/PageShell";

export function SubmitEventPage() {
  return (
    <PageShell
      eyebrow="Open submissions"
      title="Submit an event"
      intro="Send the basics in one short form. New submissions are saved as pending and reviewed before they appear publicly."
    >
      <EventSubmissionForm />
    </PageShell>
  );
}
