import { useEffect, useState } from "react";
import { searchOrganisers } from "../../lib/organiserQueries";
import type { Organiser } from "../../types/event";

type OrganiserAutocompleteProps = {
  label?: string;
  required?: boolean;
  value: string;
  selectedOrganiserId: string | null;
  onChange: (organiserName: string, organiserId: string | null) => void;
  inputClassName?: string;
};

export function OrganiserAutocomplete({
  label = "Organiser",
  required = false,
  value,
  selectedOrganiserId,
  onChange,
  inputClassName = "form-input",
}: OrganiserAutocompleteProps) {
  const [organisers, setOrganisers] = useState<Organiser[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadOrganisers() {
      try {
        setErrorMessage("");
        const results = await searchOrganisers(value);
        if (isCurrent) setOrganisers(results);
      } catch {
        if (isCurrent) {
          setOrganisers([]);
          setErrorMessage("Organiser suggestions are unavailable. Manual entry still works.");
        }
      }
    }

    const timerId = window.setTimeout(() => void loadOrganisers(), 150);
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
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        className={inputClassName}
        placeholder="Start typing an organiser, or enter a new one"
      />
      {selectedOrganiserId ? (
        <p className="text-xs font-bold text-grass">Using a saved organiser</p>
      ) : value.trim() ? (
        <p className="text-xs font-bold text-stone-600">Manual organiser entry</p>
      ) : null}
      {errorMessage ? <p className="text-xs font-bold text-corkRed">{errorMessage}</p> : null}
      {isOpen && organisers.length > 0 ? (
        <div className="absolute left-0 right-0 z-20 mt-1 max-h-64 max-w-[calc(100vw-2rem)] overflow-auto rounded-xl border-2 border-ink bg-white shadow-poster">
          {organisers.map((organiser) => (
            <button
              key={organiser.id}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(organiser.name, organiser.id);
                setIsOpen(false);
              }}
              className="block min-h-11 w-full border-b-2 border-ink px-3 py-3 text-left text-sm font-black last:border-b-0 hover:bg-posterYellow focus:bg-posterYellow focus:outline-none"
            >
              {organiser.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
