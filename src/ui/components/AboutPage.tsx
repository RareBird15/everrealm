// src/ui/components/AboutPage.tsx

export function AboutPage() {
  return (
    <details>
      <summary>About Everrealm</summary>
      <div className="about-page">
        <h2>About Everrealm</h2>
        <p>
          Everrealm is a peaceful Mesoamerican kingdom-building game designed
          from the ground up for screen readers. No combat, no timers, no fail
          states. Just calm, strategic decisions.
        </p>

        <h3>The Setting</h3>
        <p>
          Everrealm is set in a fictional world inspired by the civilizations
          of Mesoamerica — Aztec, Maya, Zapotec, Mixtec, and others — blended
          into a cohesive setting rather than tied to one specific culture.
        </p>
        <p>
          You guide a people from temporary shelters to a great capital, through
          six Ages of growth, city-states, splendor, legend, and myth. Your
          currency is Cacao — beans that were used as money throughout
          Mesoamerica. Your people build with adobe, stone, and stucco. They
          record knowledge in codices, track the stars through observatories,
          and trade through pochteca — traveling merchant-diplomats.
        </p>

        <h3>Accessibility</h3>
        <p>
          Every action has a keyboard shortcut. All information is available as
          text. No visual information is required to play. No dragging, no
          spatial reasoning, no color-coded information. Works with NVDA, JAWS,
          VoiceOver, and Orca.
        </p>
        <p>
          Optional sound effects can be enabled in Settings. They play short
          tones for key actions — no spatial audio, no background music, and
          they never replace screen reader announcements. Sound is off by
          default.
        </p>

        <h3>How to Play</h3>
        <dl>
          <dt>E</dt>
          <dd>Establish a new settlement (costs Cacao, uses a land parcel)</dd>
          <dt>A</dt>
          <dd>Advance to the next Age (requires top-tier research)</dd>
        </dl>
        <p>
          Research upgrades all your settlements simultaneously — no merging or
          pairing. Specialize settlements into prosperity buildings for
          ongoing bonuses. Buy land to expand. Build toward a Capital, then
          ascend into a permanent legacy that shapes your next playthrough.
        </p>

        <h3>About the Developer</h3>
        <p>
          Everrealm is built by Lanie, a blind writer and accessibility
          advocate who couldn't play most games made for blind people because
          they relied on spatial audio and grids she can't process. She built
          Everrealm to prove that accessible games can be genuinely fun, not
          just "accessible enough."
        </p>
      </div>
    </details>
  );
}