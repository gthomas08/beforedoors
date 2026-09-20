import { Search } from "lucide-react";

export type SearchFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
};

export function SearchField({ id, label, placeholder, value, onChange }: SearchFieldProps) {
  const hasSearchTerm = value.trim().length > 0;
  const labelId = `${id}-label`;

  return (
    <div className="max-w-140">
      <label
        id={labelId}
        htmlFor={id}
        className="font-mono text-[0.68rem] font-semibold tracking-[0.12em] text-(--app-muted) uppercase"
      >
        {label}
      </label>
      <div className="relative mt-2">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--app-muted)"
        />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-11 w-full border border-(--app-line) bg-(--app-field) pr-10 pl-10 text-sm text-(--app-ink) transition-[border-color,box-shadow] outline-none placeholder:text-(--app-muted) focus:border-(--app-accent) focus:ring-2 focus:ring-(--app-accent)/20"
        />
      </div>
      {hasSearchTerm && (
        <p className="mt-2 mb-0 text-xs text-(--app-muted)" role="status" aria-live="polite">
          Filtering by <span className="font-medium text-(--app-ink)">{value}</span>
        </p>
      )}
    </div>
  );
}
