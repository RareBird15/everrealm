// src/ui/screens/RealmSetup.tsx

import { useState, useEffect } from "react";
import { AboutPage } from "../components/AboutPage";
import { SettingsPage, applyAppearanceSettings } from "../components/SettingsPage";

interface Props {
  readonly onSubmit: (name: string) => void;
}

export function RealmSetup({ onSubmit }: Props) {
  const [name, setName] = useState("");

  // Apply saved appearance settings on mount
  useEffect(() => {
    applyAppearanceSettings(
      (localStorage.getItem("everrealm:theme") as "dark" | "light") || "dark",
      (localStorage.getItem("everrealm:textSize") as "normal" | "large" | "extra-large") || "normal",
    );
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  };

  return (
    <main aria-label="Everrealm — New Realm">
      <h1>Everrealm</h1>
      <section aria-label="Realm Setup">
        <h2>Name Your Realm</h2>
        <p>
          Welcome, ruler. Before you begin, give your realm a name. This name
          will appear throughout your realm's history.
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="realm-name">Realm Name</label>
          <input
            id="realm-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Elderglen"
            maxLength={40}
            autoFocus
            aria-describedby="realm-name-help"
          />
          <p id="realm-name-help" className="form-help">
            Enter a name for your realm, then press Enter or click Begin.
          </p>
          <button type="submit" disabled={!name.trim()}>
            Begin
          </button>
        </form>
      </section>

      <AboutPage />
      <SettingsPage />
    </main>
  );
}