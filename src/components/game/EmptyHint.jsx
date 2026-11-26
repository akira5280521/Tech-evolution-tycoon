// A short "what to do next" when a list is empty (T4 item 38).
export default function EmptyHint({ id, title, children }) {
  return (
    <div data-empty-hint={id} className="border-2 border-dashed border-[var(--game-border-strong)] bg-[var(--game-panel)] p-3">
      {title ? <p className="font-pixel text-[0.55rem] leading-5 text-[var(--game-accent)]">{title}</p> : null}
      <p className="font-term text-lg leading-6 text-[var(--game-fg)]">{children}</p>
    </div>
  );
}
