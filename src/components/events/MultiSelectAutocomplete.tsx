import { useEffect, useRef, useState } from "react";

type Option = { id: string; name: string };

type MultiSelectAutocompleteProps = {
  label: string;
  placeholder?: string;
  options: Option[];
  selectedIds: string[];
  onChange: (nextIds: string[]) => void;
  emptyMessage?: string;
};

const MAX_SUGGESTIONS = 8;

export function MultiSelectAutocomplete({
  label,
  placeholder = "Search...",
  options,
  selectedIds,
  onChange,
  emptyMessage,
}: MultiSelectAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter((o) => selectedIds.includes(o.id));
  const unselected = options.filter((o) => !selectedIds.includes(o.id));

  const q = query.toLowerCase().trim();
  const suggestions = (
    q ? unselected.filter((o) => o.name.toLowerCase().includes(q)) : unselected
  ).slice(0, MAX_SUGGESTIONS);

  function add(id: string) {
    onChange([...selectedIds, id]);
    setQuery("");
    setHighlightedIndex(0);
    inputRef.current?.focus();
  }

  function remove(id: string) {
    onChange(selectedIds.filter((x) => x !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && suggestions[highlightedIndex]) {
          add(suggestions[highlightedIndex].id);
          setIsOpen(false);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setQuery("");
        break;
      case "Backspace":
        if (query === "" && selectedIds.length > 0) {
          remove(selectedIds[selectedIds.length - 1]);
        }
        break;
    }
  }

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const resolvedEmptyMessage =
    emptyMessage ?? (q ? "No matches found" : "No options available");

  return (
    <div ref={containerRef} className="relative">
      {/* Label row */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-black">{label}</p>
        {selectedIds.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs font-black underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      {/* Tag container + input */}
      <div
        className="flex min-h-11 cursor-text flex-wrap gap-1.5 rounded-xl border-2 border-ink bg-white px-3 py-2 focus-within:ring-4 focus-within:ring-white"
        onClick={() => inputRef.current?.focus()}
      >
        {selectedOptions.map((opt) => (
          <span
            key={opt.id}
            className="inline-flex items-center gap-0.5 rounded-full border-2 border-ink bg-ink py-0.5 pl-3 pr-1.5 text-sm font-black text-paper"
          >
            {opt.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                remove(opt.id);
              }}
              className="flex h-5 w-5 items-center justify-center rounded-full text-base leading-none hover:bg-stone-600 focus:outline-none focus:ring-2 focus:ring-posterYellow"
              aria-label={`Remove ${opt.name}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={selectedIds.length === 0 ? placeholder : ""}
          className="min-w-24 flex-1 bg-transparent py-1 text-sm font-bold outline-none placeholder:font-normal placeholder:text-stone-400"
        />
      </div>

      {/* Dropdown */}
      {isOpen ? (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border-2 border-ink bg-white shadow-poster"
        >
          {suggestions.length === 0 ? (
            <li className="px-4 py-3 text-sm font-bold text-stone-500">
              {resolvedEmptyMessage}
            </li>
          ) : (
            suggestions.map((opt, i) => (
              <li
                key={opt.id}
                role="option"
                aria-selected={i === highlightedIndex}
                onMouseEnter={() => setHighlightedIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add(opt.id);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-4 py-3 text-sm font-bold transition-colors ${
                  i === highlightedIndex ? "bg-posterYellow text-ink" : "text-ink hover:bg-stone-50"
                }`}
              >
                {opt.name}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
