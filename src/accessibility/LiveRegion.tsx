// src/accessibility/LiveRegion.tsx

import type { ReactNode } from "react";

/**
 * ARIA live region for screen-reader announcements.
 *
 * Wrap content that should be announced to assistive technologies.
 * Uses `aria-live="polite"` so announcements do not interrupt other speech.
 *
 * Uses a visually-hidden technique that works reliably with NVDA,
 * JAWS, and VoiceOver. The `clip` technique can fail in some browsers;
 * we use the `sr-only` pattern with `position: absolute` and a 1px
 * size, which is the most widely supported approach.
 *
 * The key for screen reader announcements: the content must change
 * between renders for the live region to fire. The `aria-atomic="true"`
 * ensures the full text is read each time, not just the diff.
 */
export function LiveRegion({
  children,
}: {
  readonly children: ReactNode;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      role="status"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: "0",
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        clipPath: "inset(50%)",
        whiteSpace: "nowrap",
        borderWidth: "0",
      }}
    >
      {children}
    </div>
  );
}