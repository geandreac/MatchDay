import Link from "next/link";

export function BackButton({ href = "/menu" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2 border border-border hover:border-primary/40 hover:text-primary transition-all duration-200 text-text-2"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </Link>
  );
}
