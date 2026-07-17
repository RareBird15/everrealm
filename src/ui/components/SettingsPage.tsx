// src/ui/components/SettingsPage.tsx

import { useState, useEffect } from "react";

type Theme = "dark" | "light";
type TextSize = "normal" | "large" | "extra-large";

const THEME_KEY = "everrealm:theme";
const TEXT_SIZE_KEY = "everrealm:textSize";

/** Returns the saved theme, or "dark" as default. */
function getSavedTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/** Returns the saved text size, or "normal" as default. */
function getSavedTextSize(): TextSize {
  try {
    const saved = localStorage.getItem(TEXT_SIZE_KEY);
    if (saved === "large" || saved === "extra-large") return saved;
    return "normal";
  } catch {
    return "normal";
  }
}

/** Applies the theme and text size to the document root. */
export function applyAppearanceSettings(theme: Theme, textSize: TextSize) {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-text-size", textSize);
}

export function SettingsPage() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);
  const [textSize, setTextSize] = useState<TextSize>(getSavedTextSize);

  // Apply settings whenever they change
  useEffect(() => {
    applyAppearanceSettings(theme, textSize);
    try {
      localStorage.setItem(THEME_KEY, theme);
      localStorage.setItem(TEXT_SIZE_KEY, textSize);
    } catch {
      // Ignore storage errors
    }
  }, [theme, textSize]);

  return (
    <details>
      <summary>Settings</summary>
      <div className="settings-page">
        <h2>Settings</h2>
        <p>
          These settings are saved in your browser. Your operating system's
          own contrast and accessibility settings always take priority.
        </p>

        <h3>Theme</h3>
        <dl>
          <dt>
            <label htmlFor="theme-select">Color Theme</label>
          </dt>
          <dd>
            <select
              id="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
            >
              <option value="dark">Dark (default)</option>
              <option value="light">Light</option>
            </select>
          </dd>
        </dl>

        <h3>Text Size</h3>
        <dl>
          <dt>
            <label htmlFor="text-size-select">Text Size</label>
          </dt>
          <dd>
            <select
              id="text-size-select"
              value={textSize}
              onChange={(e) => setTextSize(e.target.value as TextSize)}
            >
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="extra-large">Extra Large</option>
            </select>
          </dd>
        </dl>

        <h3>Keyboard Shortcuts</h3>
        <dl>
          <dt>E</dt>
          <dd>Establish Settlement</dd>
          <dt>A</dt>
          <dd>Advance to next Age</dd>
        </dl>
        <p className="form-help">
          All other actions (research, specialize, buy land, ascend) use
          on-screen buttons for clarity.
        </p>
      </div>
    </details>
  );
}