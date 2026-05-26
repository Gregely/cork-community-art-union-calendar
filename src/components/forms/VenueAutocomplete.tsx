import { useEffect, useState } from "react";
import { searchVenues } from "../../lib/venueQueries";
import type { Venue } from "../../types/event";

type VenueAutocompleteProps = {
  label?: string;
  required?: boolean;
  value: string;
  selectedVenueId: string | null;
  onChange: (venueName: string, venueId: string | null) => void;
  inputClassName?: string;
};

export function VenueAutocomplete({
  label = "Venue",
  required = false,
  value,
  selectedVenueId,
  onChange,
  inputClassName = "form-input",
}: VenueAutocompleteProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadVenues() {
      try {
        setErrorMessage("");
        const results = await searchVenues(value);

        if (isCurrent) {
          setVenues(results);
        }
      } catch {
        if (isCurrent) {
          setVenues([]);
          setErrorMessage("Venue suggestions are unavailable. Manual venue entry still works.");
        }
      }
    }

    const timerId = window.setTimeout(() => {
      void loadVenues();
    }, 150);

    return () => {
      isCurrent = false;
      window.clearTimeout(timerId);
    };
  }, [value]);

  return (
    <div className="relative space-y-2 text-sm font-black">
      <span>
        {label}
        {required ? <span className="text-corkRed"> *</span> : null}
      </span>
      <input
        required={required}
        value={value}
        onFocus={() => setIsOpen(true)}
        onChange={(event) => {
          onChange(event.target.value, null);
          setIsOpen(true);
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 120);
        }}
        className={inputClassName}
        placeholder="Start typing a venue, or enter a new one"
      />
      {selectedVenueId ? (
        <p className="text-xs font-bold text-grass">Using a saved venue</p>
      ) : value.trim() ? (
        <p className="text-xs font-bold text-stone-600">Manual venue entry</p>
      ) : null}
      {errorMessage ? <p className="text-xs font-bold text-corkRed">{errorMessage}</p> : null}
      {isOpen && venues.length > 0 ? (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-64 max-w-[calc(100vw-2rem)] overflow-auto rounded-xl border-2 border-ink bg-white shadow-poster">
          {venues.map((venue) => (
            <button
              key={venue.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(venue.name, venue.id);
                setIsOpen(false);
              }}
              className="block min-h-11 w-full border-b-2 border-ink px-3 py-3 text-left text-sm font-black last:border-b-0 hover:bg-posterYellow focus:bg-posterYellow focus:outline-none"
            >
              <span>{venue.name}</span>
              {venue.address ? <span className="mt-1 block text-xs font-bold text-stone-600">{venue.address}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
