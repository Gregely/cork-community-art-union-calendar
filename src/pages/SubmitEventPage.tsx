import { EventSubmissionForm } from "../components/forms/EventSubmissionForm";
import { PageShell } from "../components/layout/PageShell";

export function SubmitEventPage() {
  return (
    <PageShell
      eyebrow="Open submissions"
      title="Submit an event"
      intro="Add your event to Cork Culture Board. Fill in the basics and it will be reviewed before it appears publicly."
    >
      <EventSubmissionForm />
    </PageShell>
  );
}
