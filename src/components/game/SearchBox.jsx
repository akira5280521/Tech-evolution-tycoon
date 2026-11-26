export function SearchBox({ value, onChange, placeholder = "Search", testId = "search" }) {
  const text = value || "";
  return (
    <div className="relative flex items-center">
      <input
        type="search"
        data-search={testId}
        value={text}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="min-h-12 w-full border-2 border-line bg-panel px-2 pr-10 font-pixel text-[0.6rem] text-ink placeholder:text-ink-faint"
      />
      {text ? (
        <button
          type="button"
          data-search-clear={testId}
          aria-label="Clear search"
          onClick={() => onChange?.("")}
          className="absolute right-1 flex h-9 w-9 items-center justify-center border-2 border-line bg-panel-2 font-pixel text-[0.7rem] text-ink"
        >
          X
        </button>
      ) : null}
    </div>
  );
}
