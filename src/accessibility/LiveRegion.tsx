import type { ReactNode } from "react";

/**
 * ARIA live region for screen-reader announcements.
 *
 * Wrap content that should be announced to assistive technologies.
 * Uses `aria-live="polite"` so announcements do not interrupt other speech.
 */
export function LiveRegion({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {children}
    </div>
  );
}