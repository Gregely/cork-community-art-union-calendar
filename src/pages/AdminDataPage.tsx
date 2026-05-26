import type { User } from "@supabase/supabase-js";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/layout/PageShell";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import { LoadingState } from "../components/shared/LoadingState";
import {
  createOrganiser,
  createVenue,
  deleteOrganiser,
  deleteVenue,
  getAllOrganisers,
  getAllVenues,
  updateOrganiser,
  updateVenue,
} from "../lib/adminDataQueries";
import { getCurrentUser, isCurrentUserAdmin, signOut } from "../lib/auth";
import type { Organiser, OrganiserInsert, Venue, VenueInsert } from "../types/event";

type Tab = "venues" | "organisers";
type VenueForm = { name: string; address: string; google_maps_url: string; apple_maps_url: string };
type OrganiserForm = { name: string; email: string; website: string; instagram: string };

const emptyVenue: VenueForm = { name: "", address: "", google_maps_url: "", apple_maps_url: "" };
const emptyOrganiser: OrganiserForm = { name: "", email: "", website: "", instagram: "" };

export function AdminDataPage() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("venues");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [organisers, setOrganisers] = useState<Organiser[]>([]);
  const [venueSearch, setVenueSearch] = useState("");
  const [organiserSearch, setOrganiserSearch] = useState("");
  const [newVenue, setNewVenue] = useState<VenueForm>(emptyVenue);
  const [newOrganiser, setNewOrganiser] = useState<OrganiserForm>(emptyOrganiser);
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [editingVenue, setEditingVenue] = useState<VenueForm>(emptyVenue);
  const [editingOrganiserId, setEditingOrganiserId] = useState<string | null>(null);
  const [editingOrganiser, setEditingOrganiser] = useState<OrganiserForm>(emptyOrganiser);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function checkAccessAndLoad() {
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
          setIsLoadingData(true);
          const [venueRows, organiserRows] = await Promise.all([getAllVenues(), getAllOrganisers()]);
          if (isCurrent) {
            setVenues(venueRows);
            setOrganisers(organiserRows);
          }
        }
      } catch (error) {
        if (isCurrent) setErrorMessage(error instanceof Error ? error.message : "Could not load admin data.");
      } finally {
        if (isCurrent) {
          setIsCheckingAccess(false);
          setIsLoadingData(false);
        }
      }
    }

    void checkAccessAndLoad();
    return () => {
      isCurrent = false;
    };
  }, [navigate]);

  const filteredVenues = useMemo(
    () => venues.filter((venue) => venue.name.toLowerCase().includes(venueSearch.toLowerCase().trim())),
    [venues, venueSearch],
  );
  const filteredOrganisers = useMemo(
    () => organisers.filter((organiser) => organiser.name.toLowerCase().includes(organiserSearch.toLowerCase().trim())),
    [organisers, organiserSearch],
  );

  async function handleSignOut() {
    await signOut();
    navigate("/admin/login", { replace: true });
  }

  function validateUrl(value: string, label: string) {
    if (!value.trim()) return "";
    try {
      new URL(value.trim());
      return "";
    } catch {
      return `${label} should be a valid URL.`;
    }
  }

  function validateEmail(value: string) {
    if (!value.trim()) return "";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Email should look like name@example.com.";
  }

  function venuePayload(form: VenueForm): VenueInsert {
    return {
      name: form.name.trim(),
      address: form.address.trim() || null,
      google_maps_url: form.google_maps_url.trim() || null,
      apple_maps_url: form.apple_maps_url.trim() || null,
    };
  }

  function organiserPayload(form: OrganiserForm): OrganiserInsert {
    return {
      name: form.name.trim(),
      email: form.email.trim() || null,
      website: form.website.trim() || null,
      instagram: form.instagram.trim() || null,
    };
  }

  async function addVenue(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!newVenue.name.trim()) return setErrorMessage("Venue name is required.");
    const urlError = validateUrl(newVenue.google_maps_url, "Google Maps URL") || validateUrl(newVenue.apple_maps_url, "Apple Maps URL");
    if (urlError) return setErrorMessage(urlError);
    try {
      setIsSaving(true);
      const created = await createVenue(venuePayload(newVenue));
      setVenues((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewVenue(emptyVenue);
      setSuccessMessage("Venue added.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not add venue.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveVenue(id: string) {
    setErrorMessage("");
    setSuccessMessage("");
    if (!editingVenue.name.trim()) return setErrorMessage("Venue name is required.");
    const urlError = validateUrl(editingVenue.google_maps_url, "Google Maps URL") || validateUrl(editingVenue.apple_maps_url, "Apple Maps URL");
    if (urlError) return setErrorMessage(urlError);
    try {
      setIsSaving(true);
      const updated = await updateVenue(id, venuePayload(editingVenue));
      setVenues((current) => current.map((venue) => (venue.id === id ? updated : venue)).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingVenueId(null);
      setSuccessMessage("Venue saved.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save venue.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeVenue(id: string) {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      setIsSaving(true);
      await deleteVenue(id);
      setVenues((current) => current.filter((venue) => venue.id !== id));
      setSuccessMessage("Venue deleted.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete venue.");
    } finally {
      setIsSaving(false);
    }
  }

  async function addOrganiser(event: FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    if (!newOrganiser.name.trim()) return setErrorMessage("Organiser name is required.");
    const validation = validateEmail(newOrganiser.email) || validateUrl(newOrganiser.website, "Website") || validateUrl(newOrganiser.instagram, "Instagram");
    if (validation) return setErrorMessage(validation);
    try {
      setIsSaving(true);
      const created = await createOrganiser(organiserPayload(newOrganiser));
      setOrganisers((current) => [...current, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewOrganiser(emptyOrganiser);
      setSuccessMessage("Organiser added.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not add organiser.");
    } finally {
      setIsSaving(false);
    }
  }

  async function saveOrganiser(id: string) {
    setErrorMessage("");
    setSuccessMessage("");
    if (!editingOrganiser.name.trim()) return setErrorMessage("Organiser name is required.");
    const validation = validateEmail(editingOrganiser.email) || validateUrl(editingOrganiser.website, "Website") || validateUrl(editingOrganiser.instagram, "Instagram");
    if (validation) return setErrorMessage(validation);
    try {
      setIsSaving(true);
      const updated = await updateOrganiser(id, organiserPayload(editingOrganiser));
      setOrganisers((current) => current.map((organiser) => (organiser.id === id ? updated : organiser)).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingOrganiserId(null);
      setSuccessMessage("Organiser saved.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save organiser.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeOrganiser(id: string) {
    setErrorMessage("");
    setSuccessMessage("");
    try {
      setIsSaving(true);
      await deleteOrganiser(id);
      setOrganisers((current) => current.filter((organiser) => organiser.id !== id));
      setSuccessMessage("Organiser deleted.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not delete organiser.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isCheckingAccess) return <PageShell title="Checking admin access"><LoadingState message="Checking admin access..." /></PageShell>;
  if (!isAdmin) {
    return (
      <PageShell eyebrow="Admin" title="Access denied" intro="You are signed in, but this account is not an admin.">
        <div className="rounded-2xl border-2 border-ink bg-posterYellow p-4 shadow-poster">
          <p className="break-all text-sm font-bold">{adminUser?.id ?? "No user id available"}</p>
          <button type="button" onClick={() => void handleSignOut()} className="button-primary mt-5 bg-ink text-paper">Sign out</button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Admin data" title="Manage venues and organisers" intro="Keep shared venue and organiser names tidy for autocomplete and public listings.">
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border-2 border-ink bg-white p-4 shadow-poster sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-corkRed">Signed in admin</p>
          <p className="break-all text-sm font-bold">{adminUser?.email ?? adminUser?.id}</p>
        </div>
        <div className="flex flex-col gap-2 min-[360px]:flex-row">
          <Link to="/admin" className="button-primary bg-paper text-ink">Pending submissions</Link>
          <button type="button" onClick={() => void handleSignOut()} className="button-primary bg-ink text-paper">Sign out</button>
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setActiveTab("venues")} className={`min-h-11 rounded-full border-2 border-ink px-4 py-2 text-sm font-black ${activeTab === "venues" ? "bg-ink text-paper" : "bg-white"}`}>Venues</button>
        <button type="button" onClick={() => setActiveTab("organisers")} className={`min-h-11 rounded-full border-2 border-ink px-4 py-2 text-sm font-black ${activeTab === "organisers" ? "bg-ink text-paper" : "bg-white"}`}>Organisers</button>
      </div>
      {successMessage ? <div className="mb-5 rounded-2xl border-2 border-ink bg-grass p-4 text-sm font-black text-white shadow-poster">{successMessage}</div> : null}
      {errorMessage ? <div className="mb-5"><ErrorState message={errorMessage} /></div> : null}
      {isLoadingData ? <LoadingState message="Loading admin data..." /> : activeTab === "venues" ? (
        <DataSection
          kind="venue"
          search={venueSearch}
          onSearch={setVenueSearch}
          form={newVenue}
          onFormChange={setNewVenue}
          onAdd={addVenue}
          isSaving={isSaving}
          items={filteredVenues}
          editingId={editingVenueId}
          editingForm={editingVenue}
          onStartEdit={(venue) => { setEditingVenueId(venue.id); setEditingVenue({ name: venue.name, address: venue.address ?? "", google_maps_url: venue.google_maps_url ?? "", apple_maps_url: venue.apple_maps_url ?? "" }); }}
          onEditChange={setEditingVenue}
          onCancelEdit={() => setEditingVenueId(null)}
          onSaveEdit={saveVenue}
          onDelete={removeVenue}
        />
      ) : (
        <DataSection
          kind="organiser"
          search={organiserSearch}
          onSearch={setOrganiserSearch}
          form={newOrganiser}
          onFormChange={setNewOrganiser}
          onAdd={addOrganiser}
          isSaving={isSaving}
          items={filteredOrganisers}
          editingId={editingOrganiserId}
          editingForm={editingOrganiser}
          onStartEdit={(organiser) => { setEditingOrganiserId(organiser.id); setEditingOrganiser({ name: organiser.name, email: organiser.email ?? "", website: organiser.website ?? "", instagram: organiser.instagram ?? "" }); }}
          onEditChange={setEditingOrganiser}
          onCancelEdit={() => setEditingOrganiserId(null)}
          onSaveEdit={saveOrganiser}
          onDelete={removeOrganiser}
        />
      )}
    </PageShell>
  );
}

type DataSectionProps =
  | VenueSectionProps
  | OrganiserSectionProps;

type VenueSectionProps = {
  kind: "venue"; search: string; onSearch: (value: string) => void; form: VenueForm; onFormChange: (form: VenueForm) => void; onAdd: (event: FormEvent) => void; isSaving: boolean; items: Venue[]; editingId: string | null; editingForm: VenueForm; onStartEdit: (item: Venue) => void; onEditChange: (form: VenueForm) => void; onCancelEdit: () => void; onSaveEdit: (id: string) => void; onDelete: (id: string) => void;
};
type OrganiserSectionProps = {
  kind: "organiser"; search: string; onSearch: (value: string) => void; form: OrganiserForm; onFormChange: (form: OrganiserForm) => void; onAdd: (event: FormEvent) => void; isSaving: boolean; items: Organiser[]; editingId: string | null; editingForm: OrganiserForm; onStartEdit: (item: Organiser) => void; onEditChange: (form: OrganiserForm) => void; onCancelEdit: () => void; onSaveEdit: (id: string) => void; onDelete: (id: string) => void;
};

function DataSection(props: DataSectionProps) {
  const noun = props.kind === "venue" ? "venue" : "organiser";
  return (
    <section className="space-y-5">
      <form onSubmit={props.onAdd} className="rounded-2xl border-2 border-ink bg-white p-4 shadow-poster">
        <h2 className="font-display text-2xl font-black">Add {noun}</h2>
        <EditableFields kind={props.kind} form={props.form as never} onChange={props.onFormChange as never} />
        <button type="submit" disabled={props.isSaving} className="button-primary mt-4 bg-corkRed text-white disabled:opacity-60">Add {noun}</button>
      </form>
      <label className="block space-y-2 text-sm font-black">
        Search {noun}s
        <input className="form-input bg-white" value={props.search} onChange={(event) => props.onSearch(event.target.value)} />
      </label>
      {props.items.length === 0 ? <EmptyState title={`No ${noun}s found`} message={`Add a ${noun}, or adjust the search filter.`} /> : null}
      <div className="space-y-4">
        {props.items.map((item) => (
          <article key={item.id} className="rounded-2xl border-2 border-ink bg-white p-4 shadow-poster">
            {props.editingId === item.id ? (
              <>
                <EditableFields kind={props.kind} form={props.editingForm as never} onChange={props.onEditChange as never} />
                <div className="mt-4 flex flex-col gap-2 min-[360px]:flex-row">
                  <button type="button" onClick={() => props.onSaveEdit(item.id)} disabled={props.isSaving} className="button-primary bg-grass text-white disabled:opacity-60">Save</button>
                  <button type="button" onClick={props.onCancelEdit} disabled={props.isSaving} className="button-primary bg-paper text-ink disabled:opacity-60">Cancel</button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 text-sm">
                  <h3 className="font-display text-2xl font-black">{item.name}</h3>
                  {"address" in item && item.address ? <p className="mt-2"><span className="font-black">Address:</span> {item.address}</p> : null}
                  {"email" in item && item.email ? <p className="mt-2 break-all"><span className="font-black">Email:</span> {item.email}</p> : null}
                  {"website" in item && item.website ? <p className="mt-2 break-all"><span className="font-black">Website:</span> {item.website}</p> : null}
                  {"instagram" in item && item.instagram ? <p className="mt-2 break-all"><span className="font-black">Instagram:</span> {item.instagram}</p> : null}
                </div>
                <div className="grid gap-2 min-[360px]:grid-cols-2 lg:w-48 lg:grid-cols-1">
                  <button type="button" onClick={() => props.onStartEdit(item as never)} className="button-primary bg-posterYellow text-ink">Edit</button>
                  <button type="button" onClick={() => props.onDelete(item.id)} disabled={props.isSaving} className="button-primary bg-corkRed text-white disabled:opacity-60">Delete</button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function EditableFields({ kind, form, onChange }: { kind: "venue"; form: VenueForm; onChange: (form: VenueForm) => void } | { kind: "organiser"; form: OrganiserForm; onChange: (form: OrganiserForm) => void }) {
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      <label className="space-y-2 text-sm font-black">
        Name <span className="text-corkRed">*</span>
        <input className="form-input bg-paper" value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value } as never)} />
      </label>
      {kind === "venue" ? (
        <>
          <label className="space-y-2 text-sm font-black">Address<input className="form-input bg-paper" value={form.address} onChange={(event) => onChange({ ...form, address: event.target.value } as never)} /></label>
          <label className="space-y-2 text-sm font-black">Google Maps URL<input className="form-input bg-paper" value={form.google_maps_url} onChange={(event) => onChange({ ...form, google_maps_url: event.target.value } as never)} /></label>
          <label className="space-y-2 text-sm font-black">Apple Maps URL<input className="form-input bg-paper" value={form.apple_maps_url} onChange={(event) => onChange({ ...form, apple_maps_url: event.target.value } as never)} /></label>
        </>
      ) : (
        <>
          <label className="space-y-2 text-sm font-black">Email<input className="form-input bg-paper" value={form.email} onChange={(event) => onChange({ ...form, email: event.target.value } as never)} /></label>
          <label className="space-y-2 text-sm font-black">Website<input className="form-input bg-paper" value={form.website} onChange={(event) => onChange({ ...form, website: event.target.value } as never)} /></label>
          <label className="space-y-2 text-sm font-black">Instagram<input className="form-input bg-paper" value={form.instagram} onChange={(event) => onChange({ ...form, instagram: event.target.value } as never)} /></label>
        </>
      )}
    </div>
  );
}
