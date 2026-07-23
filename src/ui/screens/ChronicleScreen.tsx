// src/ui/screens/ChronicleScreen.tsx

import { useState } from "react";

interface Props {
  /** The chronicle text to display. */
  readonly chronicle: string;
  /** Called when the player dismisses the chronicle to continue. */
  readonly onContinue: () => void;
  /** Called when the player wants to view past chronicles. */
  readonly onViewPastChronicles?: () => void;
}

/**
 * Displays the realm chronicle after ascension — v1.1.0.
 *
 * Shows the generated prose narrative with a copy button and
 * a continue button to proceed to the new game.
 */
export function ChronicleScreen({ chronicle, onContinue, onViewPastChronicles }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(chronicle);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Clipboard may not be available — try the older method
      try {
        const textarea = document.createElement("textarea");
        textarea.value = chronicle;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        // Give up silently
      }
    }
  };

  return (
    <main aria-label="Realm Chronicle">
      <h1>Realm Chronicle</h1>

      <p className="form-help">
        Your realm's story has been written. Copy it to share with others,
        or continue to begin your next playthrough.
      </p>

      <div className="chronicle-text" role="document" aria-label="Chronicle text">
        {chronicle.split("\n\n").map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="chronicle-actions">
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy chronicle text to clipboard for sharing"
        >
          {copied ? "Copied!" : "Copy Chronicle"}
        </button>

        {onViewPastChronicles && (
          <button
            type="button"
            onClick={onViewPastChronicles}
            aria-label="View chronicles from previous ascensions"
          >
            View Past Chronicles
          </button>
        )}

        <button
          type="button"
          onClick={onContinue}
          aria-label="Begin a new realm"
        >
          Begin New Realm
        </button>
      </div>
    </main>
  );
}